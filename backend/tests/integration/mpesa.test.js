// backend/tests/integration/mpesa.test.js
const request = require('supertest');
const app = require('../../server');
const pool = require('../../config/database');

describe('🧪 Testes de Integração M-Pesa', () => {
    let authToken;
    let reservaId;
    
    beforeAll(async () => {
        // Criar usuário e obter token
        const login = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'cliente@hotelparadise.com',
                password: '123456'
            });
        
        authToken = login.body.token;
        
        // Criar reserva de teste
        const reserva = await pool.query(`
            INSERT INTO reservations (user_id, room_id, check_in, check_out, guests, total_price, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'pending')
            RETURNING id
        `, [1, 1, '2025-04-01', '2025-04-02', 2, 5000]);
        
        reservaId = reserva.rows[0].id;
    });
    
    afterAll(async () => {
        await pool.query('DELETE FROM reservations WHERE id = $1', [reservaId]);
    });
    
    test('Deve iniciar pagamento M-Pesa', async () => {
        const response = await request(app)
            .post('/api/pagamentos/mpesa/iniciar')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                reservaId,
                telefone: '841234567',
                valor: 5000
            });
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.transactionId).toBeDefined();
    });
    
    test('Deve processar webhook de sucesso', async () => {
        const webhookData = {
            TransactionID: 'TEST123456',
            TransactionStatus: 'SUCCESS',
            Amount: 5000,
            CustomerMSISDN: '258841234567',
            TransactionReference: `REF_${reservaId}`,
            ThirdPartyReference: `HOTEL_${reservaId}_${Date.now()}`
        };
        
        const response = await request(app)
            .post('/api/webhooks/mpesa/confirmar')
            .send(webhookData);
        
        expect(response.status).toBe(200);
        
        // Verificar se reserva foi atualizada
        const reserva = await pool.query(
            'SELECT payment_status FROM reservations WHERE id = $1',
            [reservaId]
        );
        
        expect(reserva.rows[0].payment_status).toBe('paid');
    });
    
    test('Deve processar webhook de falha', async () => {
        // Criar nova reserva para teste de falha
        const novaReserva = await pool.query(`
            INSERT INTO reservations (user_id, room_id, check_in, check_out, guests, total_price, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'pending')
            RETURNING id
        `, [1, 2, '2025-04-03', '2025-04-04', 2, 5000]);
        
        const novaReservaId = novaReserva.rows[0].id;
        
        const webhookData = {
            TransactionID: 'TESTFAIL123',
            TransactionStatus: 'FAILED',
            Amount: 5000,
            CustomerMSISDN: '258841234567',
            TransactionReference: `REF_${novaReservaId}`,
            ThirdPartyReference: `HOTEL_${novaReservaId}_${Date.now()}`
        };
        
        const response = await request(app)
            .post('/api/webhooks/mpesa/confirmar')
            .send(webhookData);
        
        expect(response.status).toBe(200);
        
        const reserva = await pool.query(
            'SELECT payment_status FROM reservations WHERE id = $1',
            [novaReservaId]
        );
        
        expect(reserva.rows[0].payment_status).toBe('failed');
        
        await pool.query('DELETE FROM reservations WHERE id = $1', [novaReservaId]);
    });
});