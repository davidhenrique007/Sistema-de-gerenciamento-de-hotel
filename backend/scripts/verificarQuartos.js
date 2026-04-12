const db = require('./config/database');

async function verificarQuartos() {
  try {
    const quartos = await db.query('SELECT id, numero, tipo, status FROM quartos LIMIT 10');
    
    console.log('📋 Quartos cadastrados:');
    if (quartos.rows.length === 0) {
      console.log('   Nenhum quarto encontrado!');
    } else {
      quartos.rows.forEach(q => {
        console.log(`   ID: ${q.id} | Número: ${q.numero} | Tipo: ${q.tipo} | Status: ${q.status}`);
      });
      console.log(`\n📊 Total de quartos: ${quartos.rows.length}`);
    }
  } catch(e) { 
    console.error('❌ Erro:', e.message); 
  }
  process.exit();
}

verificarQuartos();
