const db = require('./config/database');

async function finalizarSessoes() {
  try {
    console.log('🔧 Finalizando sessões ativas...');
    
    const result = await db.query(`
      UPDATE user_sessions 
      SET logout_time = NOW(), 
          session_duration = EXTRACT(EPOCH FROM (NOW() - login_time))::INTEGER,
          is_active = false 
      WHERE logout_time IS NULL
      RETURNING id, user_id
    `);
    
    console.log(`✅ ${result.rows.length} sessões foram finalizadas`);
    
    // Atualizar tempo total dos usuários
    for (const session of result.rows) {
      await db.query(`
        UPDATE users 
        SET total_session_time = COALESCE(total_session_time, 0) + (
          SELECT session_duration FROM user_sessions WHERE id = $1
        )
        WHERE id = $2
      `, [session.id, session.user_id]);
    }
    
    console.log('✅ Tempo total dos usuários atualizado');
    process.exit();
  } catch(e) {
    console.error('❌ Erro:', e.message);
    process.exit();
  }
}

finalizarSessoes();
