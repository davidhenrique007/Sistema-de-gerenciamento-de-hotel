const db = require('../config/database');

async function verificarReservas() {
  try {
    console.log('📋 VERIFICANDO RESERVAS NO BANCO:\n');

    const result = await db.query(`
      SELECT
        reservation_code,
        check_in,
        check_in::date as data_sem_hora,
        status
      FROM reservations
      ORDER BY check_in DESC
    `);

    result.rows.forEach(r => {
      console.log(`   ${r.reservation_code}`);
      console.log(`      Check-in (original): ${r.check_in}`);
      console.log(`      Data (sem hora): ${r.data_sem_hora}`);
      console.log(`      Status: ${r.status}`);
      console.log('');
    });

    // Data de hoje no servidor
    const hoje = await db.query(`SELECT NOW() as agora, NOW()::date as hoje`);
    console.log(`📅 Data/Hora do servidor: ${hoje.rows[0].agora}`);
    console.log(`📅 Data (sem hora): ${hoje.rows[0].hoje}`);

    process.exit();
  } catch(e) {
    console.error('Erro:', e.message);
    process.exit();
  }
}

verificarReservas();
