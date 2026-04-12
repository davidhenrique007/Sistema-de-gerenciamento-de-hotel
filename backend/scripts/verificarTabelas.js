const db = require('./config/database');

async function verificarTabelas() {
  try {
    const tables = ['clientes', 'quartos', 'reservas'];
    for (const table of tables) {
      const result = await db.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [table]);
      
      console.log(`\n📋 Tabela ${table}:`);
      result.rows.forEach(col => console.log(`   ${col.column_name}: ${col.data_type}`));
    }
  } catch(e) { 
    console.error('Erro:', e.message); 
  }
  process.exit();
}

verificarTabelas();
