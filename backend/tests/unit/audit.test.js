// =====================================================
// TESTES DE AUDITORIA - HOTEL PARADISE
// =====================================================

const auditService = require('../../backend/services/auditService');

describe('Sistema de Auditoria', () => {
  
  describe('auditService.log()', () => {
    test('deve criar um log de auditoria', async () => {
      const log = await auditService.log({
        userId: 'test-user-123',
        userName: 'Test User',
        acao: 'TEST_ACTION',
        entidade: 'Teste',
        ip: '127.0.0.1',
        status: 'SUCCESS'
      });

      expect(log).toBeDefined();
      expect(log.acao).toBe('TEST_ACTION');
    });

    test('deve sanitizar dados sensíveis', () => {
      const sanitized = auditService.sanitizeData({
        password: 'secret123',
        email: 'test@test.com'
      });

      expect(sanitized.password).toBe('***REDACTED***');
      expect(sanitized.email).toBe('test@test.com');
    });
  });

  describe('auditService.getLogs()', () => {
    test('deve buscar logs com filtros', async () => {
      const result = await auditService.getLogs({ limit: 10 });
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });
});
