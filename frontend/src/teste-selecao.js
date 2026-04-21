// ====================================================
// TESTE PARA VERIFICAR SELEÇÃO DE QUARTO
// ====================================================
// Cole este código no console do navegador (F12)

console.log('🔍 TESTE DE SELEÇÃO DE QUARTO');
console.log('Verificando CartContext...');

// Verificar o contexto atual
if (window.__CARTAO_CONTEXT__) {
    console.log('CartContext encontrado!');
    console.log('Dados atuais:', window.__CARTAO_CONTEXT__);
} else {
    console.log('⚠️ CartContext não encontrado no window');
}

// Função para testar seleção manual
window.testarSelecao = () => {
    const quartoTeste = {
        id: 'teste-123',
        room_number: '101',
        type: 'Standard',
        price_per_night: 1500
    };
    
    const hoje = new Date();
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 2);
    
    console.log('📦 Simulando seleção de quarto:', quartoTeste);
    console.log('📅 Datas:', { checkIn: hoje, checkOut: amanha });
    
    // Tentar acessar o CartContext de alguma forma
    // Isso varia conforme sua implementação
    alert('Teste de seleção - veja o console');
};

console.log('✅ Para testar, execute: window.testarSelecao()');
