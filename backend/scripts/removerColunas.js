const db = require('./config/database');

async function removerColunas() {
  try {
    console.log('🔧 Removendo colunas problemáticas...');
    
    // Remover colunas de tracking
    await db.query('ALTER TABLE users DROP COLUMN IF EXISTS last_logout');
    await db.query('ALTER TABLE users DROP COLUMN IF EXISTS total_session_time');
    console.log('✅ Colunas last_logout e total_session_time removidas');
    
    // Verificar colunas atuais
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

removerColunas();
