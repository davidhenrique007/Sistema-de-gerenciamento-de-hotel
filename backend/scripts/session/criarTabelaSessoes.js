const db = require('./config/database');

async function criarTabelaSessoes() {
  try {
    console.log('🔧 Criando tabela user_sessions...');
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        login_time TIMESTAMP NOT NULL,
        logout_time TIMESTAMP,
        ip_address VARCHAR(45),
        user_agent TEXT,
        session_duration INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✅ Tabela user_sessions criada!');
    
    await db.query('CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_sessions_login ON user_sessions(login_time)');
    
    console.log('✅ Índices criados!');
    process.exit();
  } catch(e) {
    console.error('❌ Erro:', e.message);
    process.exit();
  }
}

criarTabelaSessoes();
