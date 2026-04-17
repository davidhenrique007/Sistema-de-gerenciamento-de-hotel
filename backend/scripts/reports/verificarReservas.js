const db = require('./config/database');

async function verificarReservas() {
  try {
    console.log('📋 VERIFICANDO RESERVAS NO SISTEMA:\n');
    
    const result = await db.query(`
      SELECT 
        reservation_code,
        TO_CHAR(check_in AT TIME ZONE 'Africa/Maputo', 'YYYY-MM-DD') as data_checkin,
        status,
        payment_status
      FROM reservations
      ORDER BY check_in DESC
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ Nenhuma reserva encontrada!');
    } else {
      result.rows.forEach(r => {
        console.log(`   ${r.reservation_code} | Check-in: ${r.data_checkin} | Status: ${r.status} | Pagamento: ${r.payment_status}`);
      });
      console.log(`\n📊 Total de reservas: ${result.rows.length}`);
    }
    
    process.exit();
  } catch(e) {
    console.error('Erro:', e.message);
    process.exit();
  }
}

verificarReservas();
