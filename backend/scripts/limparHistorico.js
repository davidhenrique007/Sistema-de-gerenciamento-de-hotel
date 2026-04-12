const db = require('./config/database');

async function limparHistorico() {
  try {
    console.log('🔧 Iniciando limpeza do histórico de reservas...\n');

    // 1. Verificar quantas reservas existem ANTES
    const antes = await db.query('SELECT COUNT(*) as total FROM reservations');
    console.log(`📊 Reservas ANTES: ${antes.rows[0].total}`);

    // 2. Listar as reservas que serão removidas
    const lista = await db.query('SELECT reservation_code, status, total_price, created_at FROM reservations ORDER BY created_at DESC');
    if (lista.rows.length > 0) {
      console.log('\n📋 RESERVAS A SEREM REMOVIDAS:');
      lista.rows.forEach(r => {
        const data = new Date(r.created_at).toISOString().split('T')[0];
        console.log(`   ❌ ${r.reservation_code} | ${r.status} | ${r.total_price} MTn | ${data}`);
      });
    }

    // 3. Limpar tabelas relacionadas primeiro (para evitar erro de chave estrangeira)
    console.log('\n🗑️ Limpando tabelas relacionadas...');
    await db.query('DELETE FROM reservation_rooms');
    await db.query('DELETE FROM reservation_services');
    await db.query('DELETE FROM logs_auditoria WHERE reserva_id IS NOT NULL');
    console.log('   ✅ Tabelas relacionadas limpas');

    // 4. Remover TODAS as reservas
    const removidas = await db.query('DELETE FROM reservations RETURNING reservation_code');
    console.log(`\n🗑️ ${removidas.rows.length} reservas foram removidas permanentemente`);

    // 5. Liberar todos os quartos
    const quartos = await db.query(`
      UPDATE rooms
      SET status = 'available',
          updated_at = NOW()
      WHERE status IN ('occupied', 'reserved')
      RETURNING room_number
    `);
    console.log(`🏨 ${quartos.rows.length} quartos foram liberados`);

    // 6. Verificar resultado final
    const depois = await db.query('SELECT COUNT(*) as total FROM reservations');
    const statsQuartos = await db.query('SELECT status, COUNT(*) as total FROM rooms GROUP BY status');

    console.log('\n📊 RESULTADO FINAL:');
    console.log(`   Reservas restantes: ${depois.rows[0].total}`);
    console.log('   Status dos quartos:');
    statsQuartos.rows.forEach(s => {
      let nome = s.status === 'available' ? 'DISPONIVEIS' : 
                 s.status === 'occupied' ? 'OCUPADOS' : 'MANUTENCAO';
      console.log(`      ${nome}: ${s.total}`);
    });

    console.log('\n✅ HISTORICO DE RESERVAS LIMPO COM SUCESSO!');
    console.log('🎉 Todas as reservas foram removidas e os quartos estao disponiveis!');

    process.exit();
  } catch(error) {
    console.error('Erro:', error.message);
    process.exit();
  }
}

limparHistorico();
