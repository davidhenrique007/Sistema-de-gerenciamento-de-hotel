// Testes unitários simplificados
describe('Testes Unitários - Hotel Paradise', () => {
  
  describe('Validação de Telefone', () => {
    const validarTelefone = (telefone) => {
      if (!telefone) return false;
      const limpo = telefone.replace(/\D/g, '');
      const regex = /^(258)?[8][4-8][0-9]{7}$/;
      return regex.test(limpo);
    };

    test('deve aceitar telefone moçambicano válido (84 123 4567)', () => {
      const telefone = '84 123 4567';
      const resultado = validarTelefone(telefone);
      expect(resultado).toBe(true);
    });

    test('deve aceitar telefone internacional (+258 84 123 4567)', () => {
      const telefone = '+258 84 123 4567';
      const resultado = validarTelefone(telefone);
      expect(resultado).toBe(true);
    });

    test('deve rejeitar telefone com prefixo inválido (83 123 4567)', () => {
      const telefone = '83 123 4567';
      const resultado = validarTelefone(telefone);
      expect(resultado).toBe(false);
    });

    test('deve rejeitar telefone com poucos dígitos', () => {
      const telefone = '84 123 45';
      const resultado = validarTelefone(telefone);
      expect(resultado).toBe(false);
    });
  });

  describe('Validação de Documento', () => {
    const validarDocumento = (documento) => {
      if (!documento) return true;
      const regex = /^[A-Z]{2}[0-9]{6}[A-Z]?$/i;
      return regex.test(documento);
    };

    test('deve aceitar BI moçambicano (AB123456C)', () => {
      const documento = 'AB123456C';
      const resultado = validarDocumento(documento);
      expect(resultado).toBe(true);
    });

    test('deve aceitar passaporte (AB123456)', () => {
      const documento = 'AB123456';
      const resultado = validarDocumento(documento);
      expect(resultado).toBe(true);
    });

    test('deve aceitar documento nulo (opcional)', () => {
      const resultado = validarDocumento(null);
      expect(resultado).toBe(true);
    });

    test('deve rejeitar documento com formato inválido', () => {
      const documento = '12345';
      const resultado = validarDocumento(documento);
      expect(resultado).toBe(false);
    });
  });

  describe('Formatação de Telefone', () => {
    const formatPhone = (telefone) => {
      if (!telefone) return '';
      const limpo = telefone.replace(/\D/g, '');
      if (limpo.length === 9) return '258' + limpo;
      if (limpo.length === 12 && limpo.startsWith('258')) return limpo;
      return limpo;
    };

    test('deve remover caracteres especiais do telefone', () => {
      const telefone = '(+258) 84 123-4567';
      const formatado = formatPhone(telefone);
      expect(formatado).toBe('258841234567');
    });
  });
});