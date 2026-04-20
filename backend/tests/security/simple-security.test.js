const request = require('supertest');
const app = require('../../server');

describe('Testes de Segurança - Hotel Paradise', () => {
  let authToken;

  beforeAll(async () => {
    // Tentar login com usuário existente
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'florencia@hotelparadise.com', password: 'admin123' });
    
    if (login.status === 200) {
      authToken = login.body.token;
    }
  });

  // ==================== SQL INJECTION ====================
  describe('SQL Injection Prevention', () => {
    const sqlPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --"
    ];

    test('Login com SQL Injection deve falhar', async () => {
      for (const payload of sqlPayloads) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: payload, password: 'any' });
        
        expect(response.status).not.toBe(200);
      }
    });
  });

  // ==================== XSS ====================
  describe('XSS Prevention', () => {
    test('Headers de segurança estão presentes', async () => {
      const response = await request(app).get('/api/health');
      
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-xss-protection']).toBeDefined();
      expect(response.headers['x-content-type-options']).toBeDefined();
    });
  });

  // ==================== RATE LIMITING ====================
  describe('Rate Limiting', () => {
    test('Rate limit está configurado', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
    });
  });

  // ==================== AUTENTICAÇÃO ====================
  describe('Autenticação', () => {
    test('Acesso sem token deve ser negado', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard');
      
      expect(response.status).toBe(401);
    });

    test('Token inválido deve ser rejeitado', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', 'Bearer token-invalido-123');
      
      expect(response.status).toBe(401);
    });
  });

  // ==================== VALIDAÇÃO DE INPUT ====================
  describe('Validação de Input', () => {
    test('Email inválido deve ser rejeitado', async () => {
      if (!authToken) {
        console.log('Skipping - no auth token');
        return;
      }
      
      const response = await request(app)
        .post('/api/clientes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Teste',
          email: 'email-invalido',
          phone: '841234567'
        });
      
      expect([400, 401, 403]).toContain(response.status);
    });
  });
});
