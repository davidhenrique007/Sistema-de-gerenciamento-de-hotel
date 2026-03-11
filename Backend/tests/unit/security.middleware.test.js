// =====================================================
// HOTEL PARADISE - SECURITY MIDDLEWARE TESTS
// =====================================================

const request = require('supertest');
const express = require('express');
const { securityMiddleware } = require('../../middlewares/security');

describe('Security Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    securityMiddleware(app);
    app.get('/test', (req, res) => res.json({ ok: true }));
  });

  test('deve ter headers de segurança do Helmet', async () => {
    const response = await request(app).get('/test');

    expect(response.headers['x-dns-prefetch-control']).toBeDefined();
    expect(response.headers['x-frame-options']).toBe('DENY');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-xss-protection']).toBe('1; mode=block');
  });

  test('deve ter CORS configurado', async () => {
    const response = await request(app)
      .options('/test')
      .set('Origin', 'http://localhost:5173');

    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(response.headers['access-control-allow-methods']).toContain('GET');
    expect(response.headers['access-control-allow-methods']).toContain('POST');
  });

  test('deve bloquear origens não autorizadas', async () => {
    const response = await request(app)
      .options('/test')
      .set('Origin', 'http://malicious-site.com');

    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});