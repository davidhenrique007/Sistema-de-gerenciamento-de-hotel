const db = require('./config/database');

async function configurarTimezone() {
  try {
    console.log('🔧 Configurando timezone do PostgreSQL...\n');
    
    // Verificar timezone atual
    const tzAtual = await db.query('SHOW timezone');
    console.log(`📅 Timezone atual: ${tzAtual.rows[0].TimeZone}`);
    
    // Configurar timezone para Africa/Maputo
    await db.query("ALTER DATABASE hotel_paradise SET timezone TO 'Africa/Maputo'");
    console.log('✅ Timezone do banco configurado para Africa/Maputo');
    
    // Configurar para a sessão atual
    await db.query("SET TIMEZONE = 'Africa/Maputo'");
    console.log('✅ Timezone da sessão configurado');
    
    // Verificar novo timezone
    const novoTz = await db.query('SHOW timezone');
    console.log(`📅 Novo timezone: ${novoTz.rows[0].TimeZone}`);
    
    // Verificar data/hora atual
    const agora = await db.query("SELECT NOW() as agora, NOW()::date as hoje");
    console.log(`\n📅 Data/Hora atual: ${agora.rows[0].agora}`);
    console.log(`📅 Data (sem hora): ${agora.rows[0].hoje}`);
    
    process.exit();
  } catch(e) {
    console.error('Erro:', e.message);
    process.exit();
  }
}

configurarTimezone();
