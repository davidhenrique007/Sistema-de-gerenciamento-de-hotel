const db = require('./config/database');

async function limparSessoes() {
  try {
    console.log('🔧 Limpando todas as sessões...');
    
    // Remover todas as sessões
    await db.query('DELETE FROM user_sessions');
    console.log('✅ Todas as sessões removidas');
    
    // Resetar os campos de tempo dos usuários
    await db.query(`
      UPDATE users 
      SET last_login = NULL, 
          last_logout = NULL, 
          total_session_time = 0
    `);
    console.log('✅ Campos de tempo dos usuários resetados');
    
    process.exit();
  } catch(e) {
    console.error('❌ Erro:', e.message);
    process.exit();
  }
}

limparSessoes();
