const db = require('./config/database');

async function verificarReservas() {
  try {
    const reservas = await db.query('SELECT * FROM reservas ORDER BY id DESC LIMIT 10');
    
    console.log('📋 Últimas reservas no banco:');
    if (reservas.rows.length === 0) {
      console.log('   Nenhuma reserva encontrada!');
    } else {
      reservas.rows.forEach(r => {
        console.log(`   ID: ${r.id} | Código: ${r.codigo_reserva} | Status: ${r.status_reserva}`);
      });
      console.log(`\n📊 Total de reservas: ${reservas.rows.length}`);
    }
  } catch(e) { 
    console.error('❌ Erro:', e.message); 
  }
  process.exit();
}

verificarReservas();
