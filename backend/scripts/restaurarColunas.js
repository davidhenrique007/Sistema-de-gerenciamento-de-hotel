const db = require('./config/database');

async function restaurarColunas() {
  try {
    console.log('🔧 Restaurando colunas da tabela users...');
    
    // Adicionar colunas de volta
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_logout TIMESTAMP');
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS total_session_time INTEGER DEFAULT 0');
    console.log('✅ Colunas last_logout e total_session_time restauradas');
    
    // Resetar os valores para NULL
    await db.query('UPDATE users SET last_logout = NULL, total_session_time = 0');
    console.log('✅ Valores resetados');
    
    // Verificar colunas
    const columns = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Colunas atuais da tabela users:');
    columns.rows.forEach(col => {
      console.log(`   - ${col.column_name}`);
    });
    
    process.exit();
  } catch(e) {
    console.error('❌ Erro:', e.message);
    process.exit();
  }
}

restaurarColunas();
