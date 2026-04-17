const db = require('./config/database');

async function verificarReservasHoje() {
  try {
    // Data de hoje no timezone correto
    const hojeResult = await db.query("SELECT (NOW() AT TIME ZONE 'Africa/Maputo')::date as hoje");
    const hoje = hojeResult.rows[0].hoje;
    
    console.log(`📅 Data de hoje (Moçambique): ${hoje}\n`);
    
    // Buscar reservas para hoje
    const reservas = await db.query(`
      SELECT 
        reservation_code,
        check_in,
        (check_in AT TIME ZONE 'Africa/Maputo')::date as data_corrigida,
        status
      FROM reservations
      WHERE (check_in AT TIME ZONE 'Africa/Maputo')::date = $1
      AND status IN ('confirmed', 'pending')
    `, [hoje]);
    
    console.log(`📊 Reservas para HOJE (${hoje}): ${reservas.rows.length}`);
    reservas.rows.forEach(r => {
      console.log(`   ✅ ${r.reservation_code} - Status: ${r.status}`);
    });
    
    process.exit();
  } catch(e) {
    console.error('Erro:', e.message);
    process.exit();
  }
}

verificarReservasHoje();
