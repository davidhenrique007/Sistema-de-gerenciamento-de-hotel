const db = require('./config/database');

async function liberarQuartos() {
  try {
    console.log('🔧 Iniciando limpeza dos quartos...');
    
    // Verificar situação atual
    const antes = await db.query('SELECT room_number, status FROM rooms ORDER BY room_number');
    console.log('\n📋 Situação ANTES:');
    antes.rows.forEach(r => {
      const icone = r.status === 'available' ? '✅' : r.status === 'occupied' ? '🛏️' : '🔧';
      console.log(`   ${icone} Quarto ${r.room_number}: ${r.status}`);
    });
    
    // Liberar todos os quartos
    const result = await db.query(`
      UPDATE rooms 
      SET status = 'available', 
          updated_at = NOW() 
      WHERE status IN ('occupied', 'maintenance', 'reserved', 'cleaning')
      RETURNING room_number, status
    `);
    
    // Verificar resultado
    const depois = await db.query('SELECT room_number, status FROM rooms ORDER BY room_number');
    console.log('\n📋 Situação DEPOIS:');
    depois.rows.forEach(r => {
      const icone = r.status === 'available' ? '✅' : r.status === 'occupied' ? '🛏️' : '🔧';
      console.log(`   ${icone} Quarto ${r.room_number}: ${r.status}`);
    });
    
    console.log(`\n✅ ${result.rows.length} quartos foram liberados com sucesso!`);
    console.log('🎉 Todos os quartos estão agora DISPONÍVEIS!');
    
    process.exit();
  } catch(error) {
    console.error('❌ Erro:', error.message);
    process.exit();
  }
}

liberarQuartos();
