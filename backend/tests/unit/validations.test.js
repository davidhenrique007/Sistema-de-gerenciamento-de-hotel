describe('Validações Adicionais', () => {
  
  describe('Validação de Email', () => {
    const validarEmail = (email) => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    };

    test('deve aceitar email válido', () => {
      expect(validarEmail('teste@email.com')).toBe(true);
    });

    test('deve rejeitar email sem @', () => {
      expect(validarEmail('testeemail.com')).toBe(false);
    });

    test('deve rejeitar email sem domínio', () => {
      expect(validarEmail('teste@')).toBe(false);
    });
  });

  describe('Validação de Preço', () => {
    const validarPreco = (preco) => {
      return preco > 0 && preco <= 100000;
    };

    test('deve aceitar preço válido', () => {
      expect(validarPreco(5000)).toBe(true);
    });

    test('deve rejeitar preço negativo', () => {
      expect(validarPreco(-100)).toBe(false);
    });

    test('deve rejeitar preço muito alto', () => {
      expect(validarPreco(200000)).toBe(false);
    });
  });

  describe('Validação de Datas', () => {
    const validarDatas = (checkIn, checkOut) => {
      const entrada = new Date(checkIn);
      const saida = new Date(checkOut);
      return saida > entrada;
    };

    test('deve aceitar datas válidas', () => {
      expect(validarDatas('2026-05-01', '2026-05-03')).toBe(true);
    });

    test('deve rejeitar check-out antes do check-in', () => {
      expect(validarDatas('2026-05-05', '2026-05-03')).toBe(false);
    });
  });
});
