const db = require('./config/database');

async function liberarTodosQuartos() {
  try {
    console.log('🔧 Iniciando limpeza de todos os quartos...\n');
    
    // Verificar situação ANTES
    const antes = await db.query(`
      SELECT status, COUNT(*) as total 
      FROM rooms 
      GROUP BY status
    `);
    
    console.log('📋 SITUAÇÃO ANTES:');
    antes.rows.forEach(r => {
      console.log(`   ${r.status}: ${r.total} quarto(s)`);
    });
    
    // Liberar TODOS os quartos para 'available'
    const result = await db.query(`
      UPDATE rooms 
      SET status = 'available',
          updated_at = NOW()
      WHERE status IN ('occupied', 'maintenance', 'reserved', 'cleaning')
      RETURNING room_number, status
    `);
    
    console.log(`\n✅ ${result.rows.length} quartos foram liberados!`);
    
    if (result.rows.length > 0) {
      console.log('\n📋 Quartos liberados:');
      result.rows.forEach(r => {
        console.log(`   ✅ Quarto ${r.room_number}: ${r.status} → available`);
      });
    }
    
    // Verificar situação DEPOIS
    const depois = await db.query(`
      SELECT status, COUNT(*) as total 
      FROM rooms 
      GROUP BY status
    `);
    
    console.log('\n📋 SITUAÇÃO DEPOIS:');
    depois.rows.forEach(r => {
      const icone = r.status === 'available' ? '✅' : '🛏️';
      console.log(`   ${icone} ${r.status}: ${r.total} quarto(s)`);
    });
    
    console.log('\n🎉 Todos os quartos estão agora DISPONÍVEIS!');
    
    process.exit();
  } catch(e) {
    console.error('❌ Erro:', e.message);
    process.exit();
  }
}

liberarTodosQuartos();
