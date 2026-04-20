const request = require('supertest');
const app = require('../../server');

describe('Testes de Segurança - OWASP Top 10', () => {
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

  // ==================== SQL INJECTION ====================
  describe('SQL Injection Prevention', () => {
    const sqlPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "admin' --",
      "1; SELECT * FROM users",
      "' OR 1=1 --",
      "'; DELETE FROM reservations WHERE '1'='1"
    ];

    test('Login com SQL Injection deve falhar', async () => {
      for (const payload of sqlPayloads) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: payload, password: 'any' });
        
        // Não deve permitir login
        expect(response.status).not.toBe(200);
      }
    });

    test('Busca de quartos com SQL Injection', async () => {
      for (const payload of sqlPayloads) {
        const response = await request(app)
          .get(`/api/quartos?search=${encodeURIComponent(payload)}`);
        
        // Deve retornar erro ou vazio, não dados sensíveis
        expect(response.status).not.toBe(500);
      }
    });
  });

  // ==================== XSS (Cross-Site Scripting) ====================
  describe('XSS Prevention', () => {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert(1)>',
      'javascript:alert("XSS")',
      '<body onload=alert("XSS")>',
      '"><script>alert("XSS")</script>',
      '<svg onload=alert(1)>',
      '"><img src=x onerror=alert(1)>'
    ];

    test('Criação de cliente com XSS deve ser sanitizado', async () => {
      for (const payload of xssPayloads) {
        const response = await request(app)
          .post('/api/clientes')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: payload,
            email: `test${Date.now()}@test.com`,
            phone: '841234567'
          });
        
        // Deve aceitar mas sanitizar
        expect(response.status).toBe(201);
        
        // Verificar se o nome foi sanitizado (não contém script)
        if (response.body.data) {
          expect(response.body.data.name).not.toContain('<script>');
          expect(response.body.data.name).not.toContain('onerror');
        }
      }
    });
  });

  // ==================== RATE LIMITING ====================
  describe('Rate Limiting', () => {
    test('Múltiplas tentativas de login devem ser bloqueadas', async () => {
      const attempts = [];
      
      // Tentar login muitas vezes
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@test.com', password: 'wrong' });
        
        attempts.push(response.status);
      }
      
      // Algumas tentativas devem ser bloqueadas (429)
      const hasRateLimit = attempts.some(status => status === 429);
      expect(hasRateLimit).toBe(true);
    });
  });

  // ==================== CSRF PROTECTION ====================
  describe('CSRF Protection', () => {
    test('Requisição sem token deve ser rejeitada', async () => {
      const response = await request(app)
        .post('/api/reservas')
        .send({
          roomId: 1,
          checkIn: '2026-05-01',
          checkOut: '2026-05-03'
        });
      
      // Sem autenticação deve falhar
      expect(response.status).toBe(401);
    });

    test('Requisição com token inválido deve ser rejeitada', async () => {
      const response = await request(app)
        .post('/api/reservas')
        .set('Authorization', 'Bearer token-invalido')
        .send({
          roomId: 1,
          checkIn: '2026-05-01',
          checkOut: '2026-05-03'
        });
      
      expect(response.status).toBe(401);
    });
  });

  // ==================== INPUT VALIDATION ====================
  describe('Input Validation', () => {
    test('Email inválido deve ser rejeitado', async () => {
      const response = await request(app)
        .post('/api/clientes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Teste',
          email: 'email-invalido',
          phone: '841234567'
        });
      
      expect(response.status).toBe(400);
    });

    test('Preço negativo deve ser rejeitado', async () => {
      const response = await request(app)
        .post('/api/reservas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          roomId: 1,
          guestId: 1,
          checkIn: '2026-05-01',
          checkOut: '2026-05-03',
          totalPrice: -100
        });
      
      expect(response.status).toBe(400);
    });

    test('Datas inválidas devem ser rejeitadas', async () => {
      const response = await request(app)
        .post('/api/reservas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          roomId: 1,
          guestId: 1,
          checkIn: '2026-05-05',
          checkOut: '2026-05-03',
          totalPrice: 1000
        });
      
      expect(response.status).toBe(400);
    });
  });

  // ==================== SENSITIVE DATA EXPOSURE ====================
  describe('Sensitive Data Protection', () => {
    test('Respostas de erro não devem expor detalhes internos', async () => {
      const response = await request(app)
        .get('/api/usuarios/999999')
        .set('Authorization', `Bearer ${authToken}`);
      
      // Não deve expor stack trace
      const body = response.body;
      expect(body.stack).toBeUndefined();
      expect(body.message).not.toContain('at ');
    });
  });
});
