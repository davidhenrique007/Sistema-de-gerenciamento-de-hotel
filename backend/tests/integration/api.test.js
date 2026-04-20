const request = require('supertest');
const app = require('../../server');

describe('API Tests - Hotel Paradise', () => {
  let adminToken;
  let clienteId;

  test('Health check deve funcionar', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  test('Login com credenciais válidas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'test123' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
    
    adminToken = response.body.token;
  });

  test('Login com senha inválida', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'senhaerrada' });
    
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test('Criar novo cliente', async () => {
    const response = await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Cliente Teste',
        email: 'cliente@teste.com',
        phone: '841234567',
        document: 'AB123456C',
        address: 'Rua Teste, 123'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBeDefined();
    
    clienteId = response.body.data.id;
  });

  test('Listar quartos disponíveis', async () => {
    const response = await request(app)
      .get('/api/quartos')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('Criar reserva', async () => {
    const response = await request(app)
      .post('/api/reservas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        guestId: clienteId,
        roomId: 101,
        checkIn: '2026-05-01',
        checkOut: '2026-05-03',
        totalPrice: 5000,
        paymentMethod: 'mpesa'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.reservation_code).toBeDefined();
  });

  test('Acesso sem token deve retornar 401', async () => {
    const response = await request(app).get('/api/quartos');
    expect(response.status).toBe(401);
  });

  test('Recurso inexistente retorna 404', async () => {
    const response = await request(app)
      .get('/api/rota-que-nao-existe')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(response.status).toBe(404);
  });
});