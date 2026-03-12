// =====================================================
// HOTEL PARADISE - TESTE SIMPLIFICADO DE AUTENTICAÇÃO
// =====================================================

const request = require('supertest');
const app = require('../../server');

describe('Teste Simplificado de Login', () => {
  
  test('Login com credenciais corretas deve funcionar', async () => {
    const response = await request(app)
      .post('/api/auth/admin/login')
      .send({
        email: 'admin@hotelparadise.com',
        password: 'admin123'
      });

    console.log('Status:', response.status);
    console.log('Body:', response.body);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
