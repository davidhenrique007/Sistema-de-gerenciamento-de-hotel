// Teste simples para validar configuração
describe('Configuração dos Testes', () => {
  test('Jest está funcionando corretamente', () => {
    expect(true).toBe(true);
  });

  test('Ambiente de teste está configurado', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});