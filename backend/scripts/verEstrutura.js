const db = require('./config/database');

async function verEstrutura() {
  try {
    const result = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 ESTRUTURA DA TABELA USERS:');
    console.log('=' .repeat(50));
    result.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(opcional)' : '(obrigatório)'}`);
    });
    console.log('=' .repeat(50));
    process.exit();
  } catch(e) {
    console.error('Erro:', e.message);
    process.exit();
  }
}

verEstrutura();
