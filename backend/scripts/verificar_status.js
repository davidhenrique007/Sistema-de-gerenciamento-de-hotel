const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'hotel_paradise'
});

async function verificarStatus() {
  try {
    // Verificar valores distintos da coluna status
    const result = await pool.query('SELECT DISTINCT status FROM rooms');
    console.log('\n=== STATUS ATUAIS NA TABELA ===');
    result.rows.forEach(r => {
      console.log(`  - ${r.status}`);
    });
    await pool.end();
  } catch (err) {
    console.error('Erro:', err.message);
    await pool.end();
  }
}

verificarStatus();
