const reconciliacaoService = require('./services/reconciliacaoService');
const contabilidadeService = require('./services/contabilidadeService');

async function testar() {
  console.log('\n🧪 TESTANDO SISTEMA DE RECONCILIAÇÃO\n');
  console.log('=' .repeat(60));
  
  // 1. Testar reconciliação M-Pesa
  console.log('\n1️⃣ Testando reconciliação M-Pesa...');
  try {
    const resultadoMpesa = await reconciliacaoService.reconciliarPagamentos(
      'mpesa', 
      '2026-03-01', 
      '2026-04-19'
    );
    console.log(`   ✅ Sucesso: ${resultadoMpesa.success}`);
    console.log(`   📊 Conciliados: ${resultadoMpesa.data.conciliados}`);
    console.log(`   ⚠️ Divergentes: ${resultadoMpesa.data.divergentes}`);
    console.log(`   📈 Taxa: ${resultadoMpesa.taxaConciliacao.toFixed(2)}%`);
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }
  
  // 2. Testar reconciliação Stripe
  console.log('\n2️⃣ Testando reconciliação Stripe...');
  try {
    const resultadoStripe = await reconciliacaoService.reconciliarPagamentos(
      'stripe', 
      '2026-03-01', 
      '2026-04-19'
    );
    console.log(`   ✅ Sucesso: ${resultadoStripe.success}`);
    console.log(`   📊 Conciliados: ${resultadoStripe.data.conciliados}`);
    console.log(`   ⚠️ Divergentes: ${resultadoStripe.data.divergentes}`);
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }
  
  // 3. Testar simulação M-Pesa
  console.log('\n3️⃣ Testando simulação M-Pesa...');
  try {
    const simMpesa = await reconciliacaoService.gateways.mpesa.simulatePayment('841234567', 5000, 'TEST-001');
    console.log(`   ${simMpesa.success ? '✅' : '❌'} ${simMpesa.message}`);
    if (simMpesa.success) {
      console.log(`   🆔 Transaction ID: ${simMpesa.transactionId}`);
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }
  
  // 4. Testar simulação Stripe (cartão válido)
  console.log('\n4️⃣ Testando simulação Stripe (cartão válido)...');
  try {
    const simStripe = await reconciliacaoService.gateways.stripe.simulatePayment('4242424242424242', 5000, 'TEST-002');
    console.log(`   ${simStripe.success ? '✅' : '❌'} ${simStripe.message}`);
    if (simStripe.success) {
      console.log(`   🆔 Transaction ID: ${simStripe.transactionId}`);
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }
  
  // 5. Testar simulação Stripe (cartão inválido)
  console.log('\n5️⃣ Testando simulação Stripe (cartão inválido)...');
  try {
    const simStripeFail = await reconciliacaoService.gateways.stripe.simulatePayment('0000000000000000', 5000, 'TEST-003');
    console.log(`   ${simStripeFail.success ? '✅' : '❌'} ${simStripeFail.message}`);
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }
  
  // 6. Testar verificação de divergências
  console.log('\n6️⃣ Verificando divergências pendentes...');
  try {
    const divergencias = await reconciliacaoService.verificarDivergenciasPendentes();
    console.log(`   📊 Total pagamentos: ${divergencias.totalPagamentos}`);
    console.log(`   ⏳ Pendentes: ${divergencias.pendentes}`);
    console.log(`   🚨 Atrasados: ${divergencias.atrasados}`);
    console.log(`   ⚠️ Alerta: ${divergencias.alerta ? 'SIM' : 'NÃO'}`);
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }
  
  // 7. Testar relatório contábil
  console.log('\n7️⃣ Gerando relatório contábil...');
  try {
    const relatorio = await contabilidadeService.gerarRelatorioFinanceiro('2026-03-01', '2026-04-19');
    console.log(`   📋 Total reservas: ${relatorio.resumo.totalReservas}`);
    console.log(`   💰 Receita total: ${relatorio.resumo.totalReceita.toFixed(2)} MTn`);
    console.log(`   💵 Total pago: ${relatorio.resumo.totalPago.toFixed(2)} MTn`);
    console.log(`   ⏳ Total pendente: ${relatorio.resumo.totalPendente.toFixed(2)} MTn`);
    console.log(`   📈 Taxa ocupação: ${relatorio.resumo.taxaOcupacao.toFixed(2)}%`);
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }
  
  // 8. Testar exportação CSV
  console.log('\n8️⃣ Testando exportação CSV...');
  try {
    const relatorio = await contabilidadeService.gerarRelatorioFinanceiro('2026-03-01', '2026-04-19');
    const csv = await contabilidadeService.exportarCSV(relatorio);
    console.log(`   ✅ CSV gerado (${csv.length} caracteres)`);
    console.log(`   📄 Primeiras linhas:\n${csv.split('\n').slice(0, 3).join('\n')}`);
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }
  
  // 9. Testar exportação XML
  console.log('\n9️⃣ Testando exportação XML...');
  try {
    const relatorio = await contabilidadeService.gerarRelatorioFinanceiro('2026-03-01', '2026-04-19');
    const xml = await contabilidadeService.exportarXML(relatorio);
    console.log(`   ✅ XML gerado (${xml.length} caracteres)`);
    console.log(`   📄 Primeiras linhas:\n${xml.split('\n').slice(0, 5).join('\n')}`);
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ TESTES CONCLUÍDOS!');
  console.log('=' .repeat(60));
}

testar().catch(console.error);
