const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'hotel_paradise'
});

async function testar() {
  try {
    console.log('\n=== TESTE DIRETO NO BANCO ===\n');
    
    // 1. Buscar um quarto ativo
    const quartos = await pool.query('SELECT id, room_number, status, deleted_at FROM rooms WHERE room_number = \'01\' LIMIT 1');
    console.log('Quarto encontrado:', quartos.rows[0]);
    
    if (quartos.rows.length > 0) {
      const id = quartos.rows[0].id;
      
      // 2. Tentar fazer soft delete
      console.log('\nTentando soft delete...');
      const update = await pool.query(
        'UPDATE rooms SET deleted_at = NOW(), status = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL RETURNING id, room_number, deleted_at, status',
        ['inactive', id]
      );
      console.log('Resultado do update:', update.rows[0]);
      
      console.log('\n✅ Soft delete funcionou!');
    }
    
    await pool.end();
  } catch (err) {
    console.error('❌ Erro detalhado:', err.message);
    console.error('Stack:', err.stack);
    await pool.end();
  }
}

testar();
