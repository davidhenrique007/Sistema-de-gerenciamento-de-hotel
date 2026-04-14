const db = require('./config/database');

async function verificarTabelas() {
  try {
    // Verificar tabela user_sessions
    const result = await db.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'user_sessions'
      )
    `);
    console.log('Tabela user_sessions existe:', result.rows[0].exists);
    
    if (!result.rows[0].exists) {
      console.log('⚠️ Criando tabela user_sessions...');
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
    }
    
    // Verificar colunas na tabela users
    const columns = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    
    const colunasExistentes = columns.rows.map(c => c.column_name);
    
    if (!colunasExistentes.includes('last_logout')) {
      await db.query('ALTER TABLE users ADD COLUMN last_logout TIMESTAMP');
      console.log('✅ Coluna last_logout adicionada');
    }
    
    if (!colunasExistentes.includes('total_session_time')) {
      await db.query('ALTER TABLE users ADD COLUMN total_session_time INTEGER DEFAULT 0');
      console.log('✅ Coluna total_session_time adicionada');
    }
    
    process.exit();
  } catch(e) {
    console.error('Erro:', e.message);
    process.exit();
  }
}

verificarTabelas();
