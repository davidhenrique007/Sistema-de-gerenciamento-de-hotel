const reconciliacaoService = require('../../services/reconciliacaoService');
const contabilidadeService = require('../../services/contabilidadeService');

describe('Reconciliação de Pagamentos', () => {
  let testStartDate;
  let testEndDate;
  
  beforeAll(() => {
    testStartDate = new Date();
    testStartDate.setDate(testStartDate.getDate() - 30);
    testEndDate = new Date();
  });
  
  describe('Reconciliação M-Pesa', () => {
    test('Deve reconciliar pagamentos M-Pesa corretamente', async () => {
      const result = await reconciliacaoService.reconciliarPagamentos(
        'mpesa',
        testStartDate.toISOString().split('T')[0],
        testEndDate.toISOString().split('T')[0]
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('gateway');
      expect(result.data).toHaveProperty('conciliados');
      expect(result.data).toHaveProperty('divergentes');
    });
    
    test('Deve detectar divergência de valor', async () => {
      const result = await reconciliacaoService.reconciliarPagamentos(
        'mpesa',
        testStartDate.toISOString().split('T')[0],
        testEndDate.toISOString().split('T')[0]
      );
      
      const divergenciasValor = result.data.detalhes.filter(d => d.tipo === 'diferenca_valor');
      expect(Array.isArray(divergenciasValor)).toBe(true);
    });
    
    test('Deve detectar pagamento não encontrado no sistema', async () => {
      const result = await reconciliacaoService.reconciliarPagamentos(
        'mpesa',
        testStartDate.toISOString().split('T')[0],
        testEndDate.toISOString().split('T')[0]
      );
      
      const naoEncontrados = result.data.detalhes.filter(d => d.tipo === 'pagamento_nao_encontrado');
      expect(Array.isArray(naoEncontrados)).toBe(true);
    });
  });
  
  describe('Reconciliação Stripe', () => {
    test('Deve reconciliar pagamentos Stripe corretamente', async () => {
      const result = await reconciliacaoService.reconciliarPagamentos(
        'stripe',
        testStartDate.toISOString().split('T')[0],
        testEndDate.toISOString().split('T')[0]
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('gateway');
    });
  });
  
  describe('Simulação de Gateways', () => {
    test('Deve simular pagamento M-Pesa com sucesso', async () => {
      const result = await reconciliacaoService.gateways.mpesa.simulatePayment('841234567', 1000, 'TEST-001');
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('transactionId');
    });
    
    test('Deve simular pagamento Stripe com sucesso', async () => {
      const result = await reconciliacaoService.gateways.stripe.simulatePayment('4242424242424242', 1000, 'TEST-001');
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('transactionId');
    });
    
    test('Deve simular falha no Stripe para cartão 0000', async () => {
      const result = await reconciliacaoService.gateways.stripe.simulatePayment('0000000000000000', 1000, 'TEST-001');
      
      expect(result.success).toBe(false);
    });
  });
  
  describe('Relatórios Contábeis', () => {
    test('Deve gerar relatório financeiro', async () => {
      const relatorio = await contabilidadeService.gerarRelatorioFinanceiro(
        testStartDate.toISOString().split('T')[0],
        testEndDate.toISOString().split('T')[0]
      );
      
      expect(relatorio.success).toBe(true);
      expect(relatorio).toHaveProperty('resumo');
      expect(relatorio).toHaveProperty('detalhes');
      expect(relatorio).toHaveProperty('impostos');
    });
    
    test('Deve exportar CSV', async () => {
      const relatorio = await contabilidadeService.gerarRelatorioFinanceiro(
        testStartDate.toISOString().split('T')[0],
        testEndDate.toISOString().split('T')[0]
      );
      
      const csv = await contabilidadeService.exportarCSV(relatorio);
      expect(typeof csv).toBe('string');
      expect(csv.includes('Código')).toBe(true);
    });
    
    test('Deve exportar XML', async () => {
      const relatorio = await contabilidadeService.gerarRelatorioFinanceiro(
        testStartDate.toISOString().split('T')[0],
        testEndDate.toISOString().split('T')[0]
      );
      
      const xml = await contabilidadeService.exportarXML(relatorio);
      expect(typeof xml).toBe('string');
      expect(xml.includes('<?xml')).toBe(true);
      expect(xml.includes('relatorioFinanceiro')).toBe(true);
    });
  });
  
  describe('Verificação de Divergências', () => {
    test('Deve verificar divergências pendentes', async () => {
      const result = await reconciliacaoService.verificarDivergenciasPendentes();
      
      expect(result).toHaveProperty('totalPagamentos');
      expect(result).toHaveProperty('pendentes');
      expect(result).toHaveProperty('atrasados');
      expect(result).toHaveProperty('alerta');
    });
  });
});
