// =====================================================
// HOTEL PARADISE - TESTES UNITÁRIOS DE CLIENTE
// =====================================================

const Cliente = require('../../models/entities/Cliente');
const clienteController = require('../../controllers/clienteController');

// Mock do modelo Cliente
jest.mock('../../models/entities/Cliente');

describe('Validações de Cliente', () => {
  
  // =====================================================
  // TESTES DE VALIDAÇÃO DE TELEFONE
  // =====================================================
  describe('Validação de Telefone', () => {
    test('deve aceitar telefone moçambicano válido (84 123 4567)', () => {
      const telefone = '84 123 4567';
      const resultado = clienteController.validarTelefone(telefone);
      expect(resultado).toBe(true);
    });

    test('deve aceitar telefone internacional (+258 84 123 4567)', () => {
      const telefone = '+258 84 123 4567';
      const resultado = clienteController.validarTelefone(telefone);
      expect(resultado).toBe(true);
    });

    test('deve rejeitar telefone com prefixo inválido (83 123 4567)', () => {
      const telefone = '83 123 4567';
      const resultado = clienteController.validarTelefone(telefone);
      expect(resultado).toBe(false);
    });

    test('deve rejeitar telefone com poucos dígitos', () => {
      const telefone = '84 123 45';
      const resultado = clienteController.validarTelefone(telefone);
      expect(resultado).toBe(false);
    });
  });

  // =====================================================
  // TESTES DE VALIDAÇÃO DE DOCUMENTO
  // =====================================================
  describe('Validação de Documento', () => {
    test('deve aceitar BI moçambicano (AB123456C)', () => {
      const documento = 'AB123456C';
      const resultado = clienteController.validarDocumento(documento);
      expect(resultado).toBe(true);
    });

    test('deve aceitar passaporte (AB123456)', () => {
      const documento = 'AB123456';
      const resultado = clienteController.validarDocumento(documento);
      expect(resultado).toBe(true);
    });

    test('deve aceitar documento nulo (opcional)', () => {
      const resultado = clienteController.validarDocumento(null);
      expect(resultado).toBe(true);
    });

    test('deve rejeitar documento com formato inválido', () => {
      const documento = '12345';
      const resultado = clienteController.validarDocumento(documento);
      expect(resultado).toBe(false);
    });
  });

  // =====================================================
  // TESTES DE FORMATAÇÃO
  // =====================================================
  describe('Formatação de Telefone', () => {
    test('deve remover caracteres especiais do telefone', () => {
      const telefone = '(+258) 84 123-4567';
      const formatado = Cliente.formatPhone(telefone);
      expect(formatado).toBe('258841234567');
    });
  });
});