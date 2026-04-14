const db = require('./config/database');

async function corrigirDados() {
  try {
    console.log('🔧 Corrigindo dados inconsistentes...');
    
    // Remover sessões com logout anterior ao login
    const removidas = await db.query(`
      DELETE FROM user_sessions 
      WHERE logout_time IS NOT NULL AND logout_time <= login_time
      RETURNING id
    `);
    console.log(`🗑️ ${removidas.rows.length} sessões inconsistentes removidas`);
    
    // Recalcular total_session_time dos usuários
    await db.query(`
      UPDATE users u
      SET total_session_time = COALESCE(
        (SELECT SUM(session_duration) FROM user_sessions WHERE user_id = u.id AND session_duration IS NOT NULL),
        0
      )
    `);
    console.log('✅ Tempo total dos usuários recalculado');
    
    // Finalizar sessões órfãs (sem logout)
    const finalizadas = await db.query(`
      UPDATE user_sessions
      SET logout_time = NOW(),
          session_duration = EXTRACT(EPOCH FROM (NOW() - login_time))::INTEGER,
          is_active = false
      WHERE logout_time IS NULL AND login_time < NOW() - INTERVAL '1 hour'
      RETURNING id
    `);
    console.log(`✅ ${finalizadas.rows.length} sessões órfãs finalizadas`);
    
    process.exit();
  } catch(e) {
    console.error('❌ Erro:', e.message);
    process.exit();
  }
}

corrigirDados();
