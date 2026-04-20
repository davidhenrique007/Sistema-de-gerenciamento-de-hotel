const request = require('supertest');
const express = require('express');

// Criar app mockado para testes
const app = express();
app.use(express.json());

// Mock do login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@test.com' && password === 'test123') {
    res.json({ success: true, token: 'mock-token-123', user: { role: 'admin' } });
  } else {
    res.status(401).json({ success: false, message: 'Credenciais inválidas' });
  }
});

// Mock do health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mock de quartos
app.get('/api/quartos', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({ success: false, message: 'Token não fornecido' });
  }
  res.json({ success: true, data: [{ id: 1, room_number: '101', type: 'Standard' }] });
});

// Mock de clientes
app.post('/api/clientes', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ success: false });
  res.status(201).json({ success: true, data: { id: 1, name: req.body.name } });
});

describe('API Tests com Mock', () => {
  let token;

  test('Health check deve funcionar', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('Login com credenciais válidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'test123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test('Login com senha inválida', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  test('Acesso com token válido', async () => {
    const res = await request(app)
      .get('/api/quartos')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  test('Acesso sem token retorna 401', async () => {
    const res = await request(app).get('/api/quartos');
    expect(res.status).toBe(401);
  });

  test('Criar cliente com token', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Cliente Teste', email: 'teste@email.com' });
    expect(res.status).toBe(201);
  });
});
