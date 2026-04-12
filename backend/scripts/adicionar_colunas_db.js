const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'hotel_paradise'
});

async function adicionarColunas() {
  try {
    console.log('\n=== ADICIONANDO COLUNAS NA TABELA ROOMS ===\n');
    
    // Verificar e adicionar coluna deleted_at
    try {
      await pool.query('ALTER TABLE rooms ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP');
      console.log('✅ Coluna deleted_at adicionada/verificada');
    } catch (err) {
      console.log('⚠️ Coluna deleted_at já existe ou erro:', err.message);
    }
    
    // Verificar e adicionar coluna description
    try {
      await pool.query('ALTER TABLE rooms ADD COLUMN IF NOT EXISTS description TEXT');
      console.log('✅ Coluna description adicionada/verificada');
    } catch (err) {
      console.log('⚠️ Coluna description já existe ou erro:', err.message);
    }
    
    // Verificar e adicionar coluna capacity
    try {
      await pool.query('ALTER TABLE rooms ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 2');
      console.log('✅ Coluna capacity adicionada/verificada');
    } catch (err) {
      console.log('⚠️ Coluna capacity já existe ou erro:', err.message);
    }
    
    // Verificar e adicionar coluna amenities
    try {
      await pool.query("ALTER TABLE rooms ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]'");
      console.log('✅ Coluna amenities adicionada/verificada');
    } catch (err) {
      console.log('⚠️ Coluna amenities já existe ou erro:', err.message);
    }
    
    // Verificar e adicionar coluna images
    try {
      await pool.query("ALTER TABLE rooms ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'");
      console.log('✅ Coluna images adicionada/verificada');
    } catch (err) {
      console.log('⚠️ Coluna images já existe ou erro:', err.message);
    }
    
    console.log('\n✅ Todas as colunas foram verificadas/adicionadas!');
    await pool.end();
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    await pool.end();
  }
}

adicionarColunas();
