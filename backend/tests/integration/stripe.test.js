// backend/tests/integration/stripe.test.js
const request = require('supertest');
const app = require('../../server');
const pool = require('../../config/database');

describe('🧪 Testes de Integração Stripe', () => {
    let authToken;
    let reservaId;

    beforeAll(async () => {
        // Criar usuário e reserva de teste
        const login = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@hotelparadise.com', password: 'admin123' });

        authToken = login.body.token;

        const reserva = await pool.query(`
            INSERT INTO reservations (user_id, room_id, check_in, check_out, guests, total_price, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'pending')
            RETURNING id
        `, [1, 1, '2025-05-01', '2025-05-02', 2, 5000]);

        reservaId = reserva.rows[0].id;
    });

    test('Deve criar PaymentIntent', async () => {
        const response = await request(app)
            .post('/api/stripe/create-intent')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                reservaId,
                valor: 5000,
                descricao: 'Reserva teste'
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.clientSecret).toBeDefined();
    });

    afterAll(async () => {
        await pool.query('DELETE FROM reservations WHERE id = $1', [reservaId]);
    });
});