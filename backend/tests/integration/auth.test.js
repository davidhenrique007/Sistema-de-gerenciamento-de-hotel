// =====================================================
// HOTEL PARADISE - TESTES DE AUTENTICAÇÃO (VERSÃO FINAL)
// =====================================================

const request = require('supertest');
const app = require('../../server');
const { models, knex } = require('../../models');

describe('Autenticação de Admin - Testes de Integração', () => {
  beforeAll(async () => {
    // Aguardar conexão com banco
    await knex.raw('SELECT 1');
  });

  afterAll(async () => {
    // Fechar conexões
    await knex.destroy();
  });

  // =====================================================
  // TESTE 1: Login com credenciais válidas
  // =====================================================
  describe('POST /api/auth/admin/login - Credenciais válidas', () => {
    test('deve retornar 200 e access token para admin', async () => {
      const response = await request(app)
        .post('/api/auth/admin/login')
        .send({
          email: 'admin@hotelparadise.com',
          password: 'admin123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.user).toHaveProperty('email', 'admin@hotelparadise.com');
      expect(response.body.data.user).toHaveProperty('role', 'admin');

      // Verificar cookie de refresh token
      expect(response.headers['set-cookie']).toBeDefined();
    });

    test('deve retornar 200 para recepcionista também', async () => {
      const response = await request(app)
        .post('/api/auth/admin/login')
        .send({
          email: 'recepcao@hotelparadise.com',
          password: 'receptionist123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('receptionist');
    });
  });

  // =====================================================
  // TESTE 2: Login com credenciais inválidas
  // =====================================================
  describe('POST /api/auth/admin/login - Credenciais inválidas', () => {
    test('deve retornar 401 com senha incorreta', async () => {
      const response = await request(app)
        .post('/api/auth/admin/login')
        .send({
          email: 'admin@hotelparadise.com',
          password: 'senha_errada'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('deve retornar 401 com email inexistente', async () => {
      const response = await request(app)
        .post('/api/auth/admin/login')
        .send({
          email: 'naoexiste@hotel.com',
          password: 'admin123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  // =====================================================
  // TESTE 3: Refresh Token
  // =====================================================
  describe('POST /api/auth/refresh-token', () => {
    let agent;

    beforeAll(() => {
      agent = request.agent(app);
    });

    test('deve gerar novo access token com refresh token válido', async () => {
      // Fazer login para obter refresh token no cookie
      const loginResponse = await agent
        .post('/api/auth/admin/login')
        .send({
          email: 'admin@hotelparadise.com',
          password: 'admin123'
        });

      expect(loginResponse.status).toBe(200);

      // Usar o mesmo agent para manter o cookie
      const refreshResponse = await agent
        .post('/api/auth/refresh-token')
        .send({}); // Cookie enviado automaticamente pelo agent

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.body.success).toBe(true);
      expect(refreshResponse.body.data).toHaveProperty('accessToken');
    });
  });
});
