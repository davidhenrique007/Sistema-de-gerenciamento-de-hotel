const db = require('./config/database');

async function limparTudo() {
  try {
    console.log('Iniciando limpeza total do sistema...');
    console.log('');

    // 1. Verificar reservas antes
    const antes = await db.query('SELECT COUNT(*) as total FROM reservations');
    console.log('Reservas ANTES:', antes.rows[0].total);

    // 2. Limpar tabelas relacionadas
    console.log('Limpando tabelas relacionadas...');
    await db.query('DELETE FROM reservation_rooms');
    await db.query('DELETE FROM reservation_services');
    console.log('OK - Tabelas relacionadas limpas');

    // 3. Remover todas as reservas
    const removidas = await db.query('DELETE FROM reservations RETURNING reservation_code');
    console.log('Reservas removidas:', removidas.rows.length);

    // 4. Liberar todos os quartos
    const quartos = await db.query(`
      UPDATE rooms 
      SET status = 'available', 
          updated_at = NOW() 
      WHERE status IN ('occupied', 'reserved')
      RETURNING room_number
    `);
    console.log('Quartos liberados:', quartos.rows.length);

    // 5. Verificar resultado
    const depois = await db.query('SELECT COUNT(*) as total FROM reservations');
    const stats = await db.query('SELECT status, COUNT(*) as total FROM rooms GROUP BY status');

    console.log('');
    console.log('RESULTADO FINAL:');
    console.log('Reservas restantes:', depois.rows[0].total);
    console.log('Status dos quartos:');
    stats.rows.forEach(s => {
      console.log('  -', s.status + ':', s.total);
    });

    console.log('');
    console.log('LIMPEZA CONCLUIDA COM SUCESSO!');
    console.log('Todos os quartos estao disponiveis.');

    process.exit();
  } catch(error) {
    console.error('ERRO:', error.message);
    process.exit();
  }
}

limparTudo();
