const db = require('../config/database');

async function liberarQuartos() {
  try {
    console.log('🔧 Iniciando limpeza dos quartos...');
    
    const result = await db.query(`
      UPDATE rooms 
      SET status = 'available' 
      WHERE status != 'available'
      RETURNING room_number
    `);
    
    console.log(`✅ ${result.rows.length} quartos foram liberados!`);
    
    const verify = await db.query('SELECT COUNT(*) as total FROM rooms WHERE status = 'available'');
    console.log(`📊 Total de quartos disponíveis: ${verify.rows[0].total}`);
    
    process.exit();
  } catch(error) {
    console.error('Erro:', error.message);
    process.exit();
  }
}

liberarQuartos();
