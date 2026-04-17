const db = require('./config/database');

async function verificarTodasReservas() {
  try {
    console.log('📋 LISTA COMPLETA DE RESERVAS:\n');
    
    const reservas = await db.query(`
      SELECT 
        reservation_code, 
        check_in::date as data_checkin, 
        status, 
        payment_status,
        total_price
      FROM reservations 
      ORDER BY check_in DESC
    `);
    
    reservas.rows.forEach(r => {
      console.log(`   ${r.reservation_code} | Check-in: ${r.data_checkin} | Status: ${r.status} | Pagamento: ${r.payment_status} | Valor: ${r.total_price}`);
    });
    
    console.log(`\n📊 Total de reservas: ${reservas.rows.length}`);
    
    // Verificar reservas para hoje
    const hoje = new Date().toISOString().split('T')[0];
    const reservasHoje = reservas.rows.filter(r => r.data_checkin === hoje && r.status === 'confirmed');
    
    console.log(`\n📅 Reservas confirmadas para HOJE (${hoje}): ${reservasHoje.length}`);
    reservasHoje.forEach(r => {
      console.log(`   ✅ ${r.reservation_code}`);
    });
    
    process.exit();
  } catch(e) {
    console.error('Erro:', e.message);
    process.exit();
  }
}

verificarTodasReservas();
