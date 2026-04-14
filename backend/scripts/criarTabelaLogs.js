const db = require('./config/database');

async function criarTabelaLogs() {
  try {
    console.log('🔧 Criando tabela logs_sistema...');
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS logs_sistema (
        id SERIAL PRIMARY KEY,
        usuario_id VARCHAR(255),
        usuario_nome VARCHAR(255),
        usuario_role VARCHAR(100),
        acao VARCHAR(100) NOT NULL,
        recurso VARCHAR(100),
        recurso_id VARCHAR(255),
        dados_antigos JSONB,
        dados_novos JSONB,
        motivo TEXT,
        ip VARCHAR(45),
        user_agent TEXT,
        sucesso BOOLEAN DEFAULT true,
        mensagem_erro TEXT,
        data_hora TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✅ Tabela logs_sistema criada com sucesso!');
    
    // Verificar se a tabela foi criada
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'logs_sistema'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Tabela logs_sistema existe!');
    }
    
    process.exit();
  } catch(e) {
    console.error('❌ Erro:', e.message);
    process.exit();
  }
}

criarTabelaLogs();
