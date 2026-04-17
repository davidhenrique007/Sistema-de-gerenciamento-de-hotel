const db = require('./config/database');

async function corrigirDataReserva() {
  try {
    console.log('🔧 Corrigindo data da reserva...\n');
    
    // Verificar data atual do servidor
    const hojeResult = await db.query("SELECT CURRENT_DATE as hoje");
    const hoje = hojeResult.rows[0].hoje;
    console.log(`📅 Data atual do servidor: ${hoje}`);
    
    // Verificar data atual da reserva
    const reserva = await db.query(`
      SELECT reservation_code, check_in::date as data_checkin, status
      FROM reservations 
      WHERE reservation_code = 'RES-2026-0004'
    `);
    
    if (reserva.rows.length === 0) {
      console.log('❌ Reserva RES-2026-0004 não encontrada!');
      process.exit();
    }
    
    console.log(`📋 Reserva RES-2026-0004: check-in = ${reserva.rows[0].data_checkin}`);
    
    // Se a data estiver diferente de hoje, corrigir
    if (reserva.rows[0].data_checkin !== hoje) {
      await db.query(`
        UPDATE reservations
        SET check_in = $1::date + INTERVAL '14 hours'
        WHERE reservation_code = 'RES-2026-0004'
      `, [hoje]);
      console.log(`✅ Data da reserva corrigida para ${hoje}`);
    } else {
      console.log('✅ Data da reserva já está correta!');
    }
    
    // Verificar o resultado
    const reservaAtualizada = await db.query(`
      SELECT reservation_code, check_in::date as data_checkin
      FROM reservations 
      WHERE reservation_code = 'RES-2026-0004'
    `);
    console.log(`📋 Reserva agora: check-in = ${reservaAtualizada.rows[0].data_checkin}`);
    
    process.exit();
  } catch(e) {
    console.error('Erro:', e.message);
    process.exit();
  }
}

corrigirDataReserva();
