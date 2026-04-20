const request = require('supertest');
const app = require('../../server');

describe('Fluxo Completo E2E', () => {
  let authToken;
  let clienteId;
  let reservaId;
  let reservationCode;

  test('1. Login do administrador', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'test123' });
    
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    authToken = response.body.token;
  });

  test('2. Criar novo cliente', async () => {
    const response = await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'João Silva',
        email: 'joao.silva@email.com',
        phone: '841234567',
        document: 'AB123456C'
      });
    
    expect(response.status).toBe(201);
    clienteId = response.body.data.id;
  });

  test('3. Criar reserva', async () => {
    const response = await request(app)
      .post('/api/reservas')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        guestId: clienteId,
        roomId: 101,
        checkIn: '2026-05-01',
        checkOut: '2026-05-03',
        totalPrice: 5000,
        paymentMethod: 'mpesa'
      });
    
    expect(response.status).toBe(201);
    reservaId = response.body.data.id;
    reservationCode = response.body.data.reservation_code;
  });

  test('4. Simular pagamento M-Pesa', async () => {
    const response = await request(app)
      .post('/api/admin/reconciliacao/simular-mpesa')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        phone: '841234567',
        amount: 5000,
        reference: reservationCode
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('5. Cancelar reserva', async () => {
    const response = await request(app)
      .patch(`/api/admin/reservas/${reservaId}/cancelar`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ reason: 'Teste de cancelamento' });
    
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('cancelled');
  });
});