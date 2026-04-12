const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function listarTabelas() {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Todas as tabelas no banco:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    process.exit();
  } catch (error) {
    console.error('Erro:', error.message);
    process.exit();
  }
}

listarTabelas();
