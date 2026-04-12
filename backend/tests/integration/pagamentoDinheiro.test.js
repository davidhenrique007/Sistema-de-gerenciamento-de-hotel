// backend/tests/integration/pagamentoDinheiro.test.js
const { describe, expect, test, beforeAll, afterAll } = require('@jest/globals');
const request = require('supertest');
const app = require('../../server');
const pool = require('../../config/database');
const reconciliacaoService = require('../../services/reconciliacaoService');

describe('🧪 Testes de Pagamento em Dinheiro', () => {
    let adminToken;
    let reservaId;
    let quartoId;
    
    beforeAll(async () => {
        // Criar quarto de teste
        const quarto = await pool.query(`
            INSERT INTO rooms (room_number, type, status, price_per_night, capacity_adults)
            VALUES ('999', 'standard', 'available', 3000, 2)
            RETURNING id
        `);
        quartoId = quarto.rows[0].id;
        
        // Criar reserva pendente
        const reserva = await pool.query(`
            INSERT INTO reservations (
                reservation_code, guest_id, room_id, user_id,
                check_in, check_out, adults_count, total_price,
                status, payment_status, created_at
            ) VALUES (
                'TEST001', 
                (SELECT id FROM guests LIMIT 1),
                $1,
                (SELECT id FROM users LIMIT 1),
                CURRENT_DATE + INTERVAL '10 days',
                CURRENT_DATE + INTERVAL '11 days',
                2, 3000,
                'pending', 'pending',
                NOW() - INTERVAL '25 hours'
            )
            RETURNING id
        `, [quartoId]);
        reservaId = reserva.rows[0].id;
        
        // Login como admin
        const login = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@hotelparadise.com', password: 'admin123' });
        
        adminToken = login.body.token;
    });
    
    afterAll(async () => {
        await pool.query('DELETE FROM reservations WHERE id = $1', [reservaId]);
        await pool.query('DELETE FROM rooms WHERE id = $1', [quartoId]);
    });
    
    test('Deve criar reserva com status PENDENTE', async () => {
        const reserva = await pool.query(
            'SELECT status, payment_status FROM reservations WHERE id = $1',
            [reservaId]
        );
        
        expect(reserva.rows[0].status).toBe('pending');
        expect(reserva.rows[0].payment_status).toBe('pending');
    });
    
    test('Deve liberar reservas vencidas via job', async () => {
        const resultado = await reconciliacaoService.liberarReservasPendentes(24);
        
        expect(resultado.canceladas).toBeGreaterThanOrEqual(1);
        
        // Verificar se reserva foi cancelada
        const reserva = await pool.query(
            'SELECT status FROM reservations WHERE id = $1',
            [reservaId]
        );
        
        expect(reserva.rows[0].status).toBe('cancelled');
        
        // Verificar se quarto foi liberado
        const quarto = await pool.query(
            'SELECT status FROM rooms WHERE id = $1',
            [quartoId]
        );
        
        expect(quarto.rows[0].status).toBe('available');
    });
    
    test('Deve confirmar pagamento via endpoint admin', async () => {
        // Criar nova reserva
        const novaReserva = await pool.query(`
            INSERT INTO reservations (
                reservation_code, guest_id, room_id, user_id,
                check_in, check_out, adults_count, total_price,
                status, payment_status
            ) VALUES (
                'TEST002',
                (SELECT id FROM guests LIMIT 1),
                $1,
                (SELECT id FROM users LIMIT 1),
                CURRENT_DATE + INTERVAL '15 days',
                CURRENT_DATE + INTERVAL '16 days',
                2, 3000,
                'pending', 'pending'
            )
            RETURNING id
        `, [quartoId]);
        
        const novaReservaId = novaReserva.rows[0].id;
        
        const response = await request(app)
            .post('/api/admin/pagamento-dinheiro/confirmar')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ reservaId: novaReservaId });
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        
        // Verificar reserva
        const reserva = await pool.query(
            'SELECT status, payment_status FROM reservations WHERE id = $1',
            [novaReservaId]
        );
        
        expect(reserva.rows[0].status).toBe('confirmed');
        expect(reserva.rows[0].payment_status).toBe('paid');
        
        await pool.query('DELETE FROM reservations WHERE id = $1', [novaReservaId]);
    });
});