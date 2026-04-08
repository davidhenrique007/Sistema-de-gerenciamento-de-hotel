const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'hotel_paradise'
});
(async () => {
  const result = await pool.query('SELECT id, room_number, type FROM rooms ORDER BY room_number LIMIT 10');
  console.log('\n=== UUIDs REAIS ===\n');
  result.rows.forEach(r => {
    console.log(`Quarto ${r.room_number} (${r.type}): ${r.id}`);
  });
  await pool.end();
})();
