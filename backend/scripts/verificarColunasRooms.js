const db = require('../config/database');

async function verificarColunas() {
  try {
    const result = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'rooms' 
      ORDER BY ordinal_position
    `);

    console.log('📋 Colunas da tabela rooms:');
    result.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type}`);
    });
    
    process.exit();
  } catch (error) {
    console.error('Erro:', error.message);
    process.exit();
  }
}

verificarColunas();
