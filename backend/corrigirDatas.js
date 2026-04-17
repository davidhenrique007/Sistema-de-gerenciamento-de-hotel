const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function corrigirDatasReservas() {
  try {
    console.log('🔧 Corrigindo datas das reservas...\n');

    // Verificar data atual
    const agora = await pool.query("SELECT NOW() as agora, NOW()::date as hoje");
    const hoje = agora.rows[0].hoje;
    console.log(`📅 Data atual do servidor: ${hoje}`);

    // Atualizar reservas para a data atual
    await pool.query(`
      UPDATE reservations 
      SET check_in = $1::date + INTERVAL '14 hours'
      WHERE status = 'confirmed' AND check_in::date != $1
    `, [hoje]);
    console.log('✅ Datas das reservas corrigidas');

    // Verificar resultado
    const reservas = await pool.query(`
      SELECT reservation_code, check_in::date as data_checkin, status
      FROM reservations
      WHERE status = 'confirmed'
    `);
    
    console.log('\n📋 RESERVAS APÓS CORREÇÃO:');
    reservas.rows.forEach(r => {
      console.log(`   ${r.reservation_code} | Check-in: ${r.data_checkin} | Status: ${r.status}`);
    });

    process.exit();
  } catch(e) {
    console.error('Erro:', e.message);
    process.exit();
  }
}

corrigirDatasReservas();
