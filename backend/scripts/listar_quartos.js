const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'hotel_paradise'
});

async function listarQuartos() {
  try {
    const result = await pool.query('SELECT id, room_number, type FROM rooms ORDER BY room_number');
    console.log('\n=== UUIDs REAIS DOS QUARTOS ===\n');
    result.rows.forEach(r => {
      console.log(`  Quarto ${r.room_number} (${r.type}): ${r.id}`);
    });
    await pool.end();
  } catch (err) {
    console.error('Erro:', err.message);
    await pool.end();
  }
}

listarQuartos();
