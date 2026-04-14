const db = require('./config/database');

async function limpezaForcada() {
  try {
    console.log('🔧 Limpeza FORÇADA do sistema...');
    
    // 1. Deletar TODAS as sessões
    await db.query('TRUNCATE TABLE user_sessions RESTART IDENTITY');
    console.log('✅ 1. Todas as sessões removidas (TRUNCATE)');
    
    // 2. Resetar TODOS os campos de tempo dos usuários
    await db.query(`
      UPDATE users 
      SET last_login = NULL, 
          last_logout = NULL, 
          total_session_time = 0
    `);
    console.log('✅ 2. Campos de tempo resetados');
    
    // 3. Verificar resultado
    const users = await db.query('SELECT name, email, role, last_login, last_logout, total_session_time FROM users');
    console.log('\n📋 USUÁRIOS APÓS LIMPEZA:');
    users.rows.forEach(u => {
      console.log(`   ${u.name} (${u.email}) - ${u.role} | Login: ${u.last_login || '-'} | Logout: ${u.last_logout || '-'} | Tempo: ${u.total_session_time || 0}s`);
    });
    
    console.log('\n✅ Limpeza FORÇADA concluída!');
    process.exit();
  } catch(e) {
    console.error('❌ Erro:', e.message);
    process.exit();
  }
}

limpezaForcada();
