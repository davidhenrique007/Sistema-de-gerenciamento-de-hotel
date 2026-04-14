const db = require('./config/database');

async function inserirLogsTeste() {
  try {
    console.log('🔧 Inserindo logs de teste...');
    
    await db.query(`
      INSERT INTO logs_sistema (usuario_nome, usuario_role, acao, recurso, ip, sucesso, data_hora)
      VALUES 
        ('Administrador', 'admin', 'LOGIN_SUCCESS', 'auth', '127.0.0.1', true, NOW() - INTERVAL '1 hour'),
        ('Administrador', 'admin', 'CREATE_USER', 'user', '127.0.0.1', true, NOW() - INTERVAL '2 hours'),
        ('test', 'financial', 'LOGIN_FAILURE', 'auth', '192.168.1.1', false, NOW() - INTERVAL '3 hours'),
        ('Administrador', 'admin', 'UPDATE_USER', 'user', '127.0.0.1', true, NOW() - INTERVAL '4 hours'),
        ('test', 'financial', 'RESET_PASSWORD', 'user', '192.168.1.1', true, NOW() - INTERVAL '5 hours')
    `);
    
    console.log('✅ Logs de teste inseridos!');
    
    const result = await db.query('SELECT COUNT(*) as total FROM logs_sistema');
    console.log(`📊 Total de logs: ${result.rows[0].total}`);
    
    process.exit();
  } catch(e) {
    console.error('❌ Erro:', e.message);
    process.exit();
  }
}

inserirLogsTeste();
