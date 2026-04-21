const request = require('supertest');
const app = require('../../server');

describe('WAF - Testes de Segurança', () => {
  let authToken;

  beforeAll(async () => {
    // Login para obter token
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@hotelparadise.com', password: 'admin123' });
    
    if (login.status === 200) {
      authToken = login.body.token;
    }
  });

  describe('SQL Injection Protection', () => {
    const sqlPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --"
    ];

    test('SQL Injection deve ser bloqueado pelo WAF', async () => {
      for (const payload of sqlPayloads) {
        const response = await request(app)
          .get(`/api/quartos?search=${encodeURIComponent(payload)}`)
          .set('Authorization', `Bearer ${authToken}`);
        
        // WAF deve bloquear com 403
        expect(response.status).toBe(403);
        expect(response.body.message).toContain('bloqueado');
      }
    });
  });

  describe('XSS Protection', () => {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert(1)>'
    ];

    test('XSS deve ser bloqueado pelo WAF', async () => {
      for (const payload of xssPayloads) {
        const response = await request(app)
          .post('/api/clientes')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: payload,
            email: 'test@test.com',
            phone: '841234567'
          });
        
        expect(response.status).toBe(403);
        expect(response.body.message).toContain('bloqueado');
      }
    });
  });

  describe('Path Traversal Protection', () => {
    const pathPayloads = [
      '../../../etc/passwd',
      '/etc/passwd',
      'C:\\windows\\system32'
    ];

    test('Path Traversal deve ser bloqueado pelo WAF', async () => {
      for (const payload of pathPayloads) {
        const response = await request(app)
          .get(`/api/quartos?file=${encodeURIComponent(payload)}`)
          .set('Authorization', `Bearer ${authToken}`);
        
        expect(response.status).toBe(403);
        expect(response.body.message).toContain('bloqueado');
      }
    });
  });

  describe('Requisições Legítimas', () => {
    test('Requisição normal deve passar', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
    });

    test('Requisição autenticada com dados normais deve passar', async () => {
      const response = await request(app)
        .get('/api/quartos?search=suite')
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.status).toBe(200);
    });
  });
});
