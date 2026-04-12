const db = require('./config/database');

async function limparReservas() {
  try {
    console.log('🔧 Iniciando limpeza das reservas...');

    // Verificar quantas reservas existem ANTES
    const antes = await db.query('SELECT COUNT(*) as total FROM reservations');
    console.log(`📊 Reservas ANTES: ${antes.rows[0].total}`);

    // Cancelar todas as reservas ativas
    const canceladas = await db.query(`
      UPDATE reservations 
      SET status = 'cancelled',
          cancellation_reason = 'Limpeza administrativa do sistema',
          updated_at = NOW()
      WHERE status IN ('confirmed', 'pending')
      RETURNING reservation_code
    `);
    console.log(`✅ ${canceladas.rows.length} reservas ativas foram canceladas`);

    // Opcional: Remover reservas antigas (mais de 30 dias)
    const removidas = await db.query(`
      DELETE FROM reservations 
      WHERE created_at < NOW() - INTERVAL '30 days'
      AND status = 'cancelled'
      RETURNING reservation_code
    `);
    console.log(`🗑️ ${removidas.rows.length} reservas antigas foram removidas`);

    // Verificar quantas reservas restam
    const depois = await db.query('SELECT COUNT(*) as total FROM reservations');
    console.log(`📊 Reservas DEPOIS: ${depois.rows[0].total}`);

    // Garantir que todos os quartos estão disponíveis
    const quartos = await db.query(`
      UPDATE rooms 
      SET status = 'available',
          updated_at = NOW()
      WHERE status IN ('occupied', 'reserved')
      RETURNING room_number
    `);
    console.log(`🏨 ${quartos.rows.length} quartos foram liberados`);

    console.log('\n✅ LIMPEZA CONCLUÍDA!');
    console.log('🎉 Todos os quartos estão disponíveis e as reservas foram limpas!');

    process.exit();
  } catch(error) {
    console.error('❌ Erro:', error.message);
    process.exit();
  }
}

limparReservas();
