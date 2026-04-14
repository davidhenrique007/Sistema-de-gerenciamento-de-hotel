const db = require('./config/database');

async function reverter() {
  try {
    console.log('🔧 Revertendo alterações...');
    
    // Remover tabela user_sessions
    await db.query('DROP TABLE IF EXISTS user_sessions');
    console.log('✅ Tabela user_sessions removida');
    
    // Remover colunas adicionadas
    await db.query('ALTER TABLE users DROP COLUMN IF EXISTS last_logout');
    await db.query('ALTER TABLE users DROP COLUMN IF EXISTS total_session_time');
    await db.query('ALTER TABLE users DROP COLUMN IF EXISTS last_heartbeat');
    console.log('✅ Colunas extras removidas');
    
    // Restaurar apenas last_login (que já existia)
    console.log('✅ Keep: users.last_login (original)');
    
    process.exit();
  } catch(e) {
    console.error('❌ Erro:', e.message);
    process.exit();
  }
}

reverter();
