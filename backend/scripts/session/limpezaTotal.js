const db = require('./config/database');

async function limpezaTotal() {
  try {
    console.log('🔧 Iniciando limpeza TOTAL do sistema...');
    
    // 1. Limpar sessões
    await db.query('DELETE FROM user_sessions');
    console.log('✅ 1. Sessões removidas');
    
    // 2. Resetar campos de tempo dos usuários
    await db.query(`
      UPDATE users 
      SET last_login = NULL, 
          last_logout = NULL, 
          total_session_time = 0
    `);
    console.log('✅ 2. Campos de tempo resetados');
    
    // 3. Verificar usuários restantes
    const users = await db.query('SELECT id, name, email, role FROM users');
    console.log(`\n📋 Usuários no sistema:`);
    users.rows.forEach(u => {
      console.log(`   - ${u.name} (${u.email}) - ${u.role}`);
    });
    
    console.log(`\n✅ Limpeza concluída! Total: ${users.rows.length} usuários`);
    process.exit();
  } catch(e) {
    console.error('❌ Erro:', e.message);
    process.exit();
  }
}

limpezaTotal();
