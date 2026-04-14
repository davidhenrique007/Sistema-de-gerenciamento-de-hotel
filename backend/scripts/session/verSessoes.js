const db = require('./config/database');

async function verSessoes() {
  try {
    const result = await db.query(`
      SELECT 
        u.name,
        u.email,
        s.login_time,
        s.logout_time,
        s.session_duration,
        s.is_active,
        EXTRACT(EPOCH FROM (NOW() - s.login_time))::INTEGER as segundos_ativo
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.logout_time IS NULL
      ORDER BY s.login_time DESC
    `);
    
    console.log('\n📊 SESSÕES ATIVAS:');
    console.log('=' .repeat(80));
    
    result.rows.forEach(s => {
      const ativoMin = Math.floor(s.segundos_ativo / 60);
      console.log(`   Usuário: ${s.name}`);
      console.log(`   Login: ${new Date(s.login_time).toLocaleString('pt-BR')}`);
      console.log(`   Ativo há: ${ativoMin} minutos`);
      console.log('-'.repeat(50));
    });
    
    console.log(`\nTotal: ${result.rows.length} sessões ativas`);
    process.exit();
  } catch(e) {
    console.error('Erro:', e.message);
    process.exit();
  }
}

verSessoes();
