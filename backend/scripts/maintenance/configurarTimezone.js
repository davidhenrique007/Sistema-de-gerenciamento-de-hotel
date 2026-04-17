const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function configurarTimezone() {
  try {
    console.log('🔧 Configurando timezone do PostgreSQL...\n');

    // Verificar timezone atual
    const tzAtual = await pool.query('SHOW timezone');
    console.log(`📅 Timezone atual: ${tzAtual.rows[0].TimeZone}`);

    // Configurar timezone para Africa/Maputo
    await pool.query("ALTER DATABASE hotel_paradise SET timezone TO 'Africa/Maputo'");
    console.log('✅ Timezone do banco configurado para Africa/Maputo');

    // Configurar para a sessão atual
    await pool.query("SET TIMEZONE = 'Africa/Maputo'");
    console.log('✅ Timezone da sessão configurado');

    // Verificar novo timezone
    const novoTz = await pool.query('SHOW timezone');
    console.log(`📅 Novo timezone: ${novoTz.rows[0].TimeZone}`);

    // Verificar data/hora atual
    const agora = await pool.query("SELECT NOW() as agora, NOW()::date as hoje");
    console.log(`\n📅 Data/Hora atual: ${agora.rows[0].agora}`);
    console.log(`📅 Data (sem hora): ${agora.rows[0].hoje}`);

    process.exit();
  } catch(e) {
    console.error('Erro:', e.message);
    process.exit();
  }
}

configurarTimezone();
