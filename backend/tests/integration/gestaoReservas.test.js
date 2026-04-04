// backend/tests/integration/gestaoReservas.test.js
const { describe, expect, test, beforeAll, afterAll } = require('@jest/globals');
const request = require('supertest');
const app = require('../../server');
const pool = require('../../config/database');

describe('Gestão de Reservas - Dashboard do Cliente', () => {
    let authToken;
    let reservaId;
    
    beforeAll(async () => {
        const login = await request(app)
            .post('/api/auth/login')
            .send({ email: 'cliente@teste.com', password: '123456' });
        authToken = login.body.token;
        
        const reserva = await pool.query(`
            INSERT INTO reservations (reservation_code, guest_id, room_id, user_id, check_in, check_out, total_price, status)
            VALUES ('TEST001', (SELECT id FROM guests LIMIT 1), (SELECT id FROM rooms LIMIT 1), 
                    (SELECT id FROM users LIMIT 1), CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '11 days', 5000, 'confirmed')
            RETURNING id
        `);
        reservaId = reserva.rows[0].id;
    });
    
    test('Deve listar reservas do cliente', async () => {
        const response = await request(app)
            .get('/api/reservas/cliente')
            .set('Authorization', `Bearer ${authToken}`);
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
    });
    
    test('Deve cancelar reserva dentro do prazo', async () => {
        const response = await request(app)
            .put(`/api/reservas/${reservaId}/cancelar`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ motivo: 'Teste cancelamento' });
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        
        const reserva = await pool.query('SELECT status FROM reservations WHERE id = $1', [reservaId]);
        expect(reserva.rows[0].status).toBe('cancelled');
    });
});