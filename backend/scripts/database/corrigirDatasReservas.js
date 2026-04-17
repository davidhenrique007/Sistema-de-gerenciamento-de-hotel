const db = require('./config/database');

async function corrigirDatasReservas() {
  try {
    console.log('🔧 Corrigindo datas das reservas...\n');
    
    // Corrigir todas as reservas
    await db.query(`
      UPDATE reservations 
      SET check_in = check_in + INTERVAL '2 hours'
      WHERE check_in::date = '2026-04-16'
    `);
    
    console.log('✅ Datas das reservas corrigidas (+2 horas)');
    
    // Verificar resultado
    const reservas = await db.query(`
      SELECT reservation_code, 
             check_in::date as data_checkin,
             (check_in AT TIME ZONE 'Africa/Maputo')::date as data_corrigida
      FROM reservations
      ORDER BY check_in DESC
    `);
    
    console.log('\n📋 RESERVAS APÓS CORREÇÃO:');
    reservas.rows.forEach(r => {
      console.log(`   ${r.reservation_code} | Data original: ${r.data_checkin} | Data corrigida: ${r.data_corrigida}`);
    });
    
    process.exit();
  } catch(e) {
    console.error('Erro:', e.message);
    process.exit();
  }
}

corrigirDatasReservas();
