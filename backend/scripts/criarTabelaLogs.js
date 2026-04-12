const db = require('./config/database');

async function criarTabelaLogs() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS logs_auditoria (
        id SERIAL PRIMARY KEY,
        usuario_id VARCHAR(255),
        usuario_nome VARCHAR(255),
        usuario_role VARCHAR(100),
        acao VARCHAR(100) NOT NULL,
        reserva_id VARCHAR(255),
        dados_antigos JSONB,
        dados_novos JSONB,
        motivo TEXT,
        ip VARCHAR(45),
        data_hora TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Tabela logs_auditoria criada/verificada com sucesso!');
  } catch(e) {
    console.log('⚠️ Tabela logs_auditoria:', e.message);
  }
  process.exit();
}

criarTabelaLogs();
