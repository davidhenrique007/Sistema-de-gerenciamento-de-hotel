const db = require('./config/database');

async function testarMetricas() {
  try {
    console.log('🔧 TESTANDO MÉTRICAS DO DIA...\n');
    
    const result = await db.query(`
      SELECT 
        TO_CHAR(NOW() AT TIME ZONE 'Africa/Maputo', 'YYYY-MM-DD') as hoje,
        COUNT(CASE WHEN TO_CHAR(check_in AT TIME ZONE 'Africa/Maputo', 'YYYY-MM-DD') = TO_CHAR(NOW() AT TIME ZONE 'Africa/Maputo', 'YYYY-MM-DD') AND status IN ('confirmed', 'pending') THEN 1 END) as reservas_hoje
      FROM reservations
    `);
    
    console.log(`📅 Data hoje (Moçambique): ${result.rows[0].hoje}`);
    console.log(`📊 Reservas para hoje: ${result.rows[0].reservas_hoje}`);
    
    // Listar todas as reservas com datas corrigidas
    const todasReservas = await db.query(`
      SELECT 
        reservation_code,
        TO_CHAR(check_in AT TIME ZONE 'Africa/Maputo', 'YYYY-MM-DD') as data_checkin,
        status
      FROM reservations
      ORDER BY check_in DESC
    `);
    
    console.log('\n📋 TODAS AS RESERVAS:');
    todasReservas.rows.forEach(r => {
      console.log(`   ${r.reservation_code} | Check-in: ${r.data_checkin} | Status: ${r.status}`);
    });
    
    process.exit();
  } catch(e) {
    console.error('Erro:', e.message);
    process.exit();
  }
}

testarMetricas();
