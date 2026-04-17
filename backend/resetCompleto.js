const db = require('./config/database');

async function resetCompleto() {
  try {
    console.log('🔧 Reset COMPLETO do sistema...\n');
    
    // 1. Remover TODAS as reservas
    const reservas = await db.query('DELETE FROM reservations');
    console.log(`✅ ${reservas.rowCount} reservas removidas`);
    
    // 2. Limpar tabelas relacionadas
    await db.query('DELETE FROM reservation_rooms');
    await db.query('DELETE FROM reservation_services');
    console.log('✅ Tabelas relacionadas limpas');
    
    // 3. Liberar todos os quartos
    const quartos = await db.query(`
      UPDATE rooms 
      SET status = 'available',
          updated_at = NOW()
      WHERE status IN ('occupied', 'maintenance', 'reserved', 'cleaning')
    `);
    console.log(`✅ ${quartos.rowCount} quartos liberados`);
    
    // 4. Verificar resultado
    const statsReservas = await db.query('SELECT COUNT(*) as total FROM reservations');
    const statsQuartos = await db.query(`
      SELECT status, COUNT(*) as total
      FROM rooms
      GROUP BY status
    `);
    
    console.log('\n📊 RESULTADO FINAL:');
    console.log(`   Reservas restantes: ${statsReservas.rows[0].total}`);
    console.log('   Quartos:');
    statsQuartos.rows.forEach(s => {
      const icone = s.status === 'available' ? '✅' : '🛏️';
      console.log(`      ${icone} ${s.status}: ${s.total}`);
    });
    
    console.log('\n🎉 Reset completo realizado!');
    process.exit();
  } catch(e) {
    console.error('❌ Erro:', e.message);
    process.exit();
  }
}

resetCompleto();
