const db = require('./config/database');

async function verificarReserva() {
  try {
    const result = await db.query(`
      SELECT 
        reservation_code,
        check_in,
        (check_in AT TIME ZONE 'Africa/Maputo')::date as data_corrigida,
        status,
        payment_status
      FROM reservations
      WHERE reservation_code = 'RES-2026-0001'
    `);
    
    if (result.rows.length > 0) {
      const r = result.rows[0];
      console.log(`📋 Reserva: ${r.reservation_code}`);
      console.log(`   Check-in original: ${r.check_in}`);
      console.log(`   Data corrigida (Moçambique): ${r.data_corrigida}`);
      console.log(`   Status: ${r.status}`);
      console.log(`   Pagamento: ${r.payment_status}`);
      
      const hoje = new Date();
      console.log(`\n📅 Data atual (computador): ${hoje.toLocaleDateString('pt-BR')}`);
    } else {
      console.log('❌ Reserva não encontrada');
    }
    
    process.exit();
  } catch(e) {
    console.error('Erro:', e.message);
    process.exit();
  }
}

verificarReserva();
