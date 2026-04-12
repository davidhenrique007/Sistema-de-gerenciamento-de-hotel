const db = require('./config/database');

async function verificarClientes() {
  try {
    const clientes = await db.query('SELECT id, nome, email FROM clientes LIMIT 5');
    
    console.log('📋 Clientes cadastrados:');
    if (clientes.rows.length === 0) {
      console.log('   Nenhum cliente encontrado!');
    } else {
      clientes.rows.forEach(c => {
        console.log(`   ID: ${c.id} | Nome: ${c.nome} | Email: ${c.email}`);
      });
      console.log(`\n📊 Total de clientes encontrados: ${clientes.rows.length}`);
    }
  } catch(e) { 
    console.error('❌ Erro:', e.message); 
  }
  process.exit();
}

verificarClientes();
