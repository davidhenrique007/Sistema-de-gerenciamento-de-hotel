const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'hotel_paradise'
});

async function adicionarColuna() {
  try {
    console.log('\n=== ADICIONANDO COLUNA DELETED_AT ===\n');
    
    // Adicionar coluna deleted_at
    await pool.query('ALTER TABLE rooms ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP');
    console.log('✅ Coluna deleted_at adicionada');
    
    // Verificar se a coluna foi adicionada
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'rooms' AND column_name = 'deleted_at'
    `);
    
    console.log(`Coluna deleted_at existe? ${result.rows.length > 0}`);
    
    await pool.end();
    console.log('\n✅ Coluna adicionada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    await pool.end();
  }
}

adicionarColuna();
