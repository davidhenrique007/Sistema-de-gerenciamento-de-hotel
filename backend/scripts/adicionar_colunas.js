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
    
    // Verificar colunas existentes
    const existingColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'rooms'
    `);
    
    const colunasExistentes = existingColumns.rows.map(r => r.column_name);
    
    // Adicionar description
    if (!colunasExistentes.includes('description')) {
      await pool.query('ALTER TABLE rooms ADD COLUMN description TEXT');
      console.log('✅ Coluna description adicionada');
    } else {
      console.log('ℹ️ Coluna description já existe');
    }
    
    // Adicionar capacity
    if (!colunasExistentes.includes('capacity')) {
      await pool.query('ALTER TABLE rooms ADD COLUMN capacity INTEGER DEFAULT 2');
      console.log('✅ Coluna capacity adicionada');
    } else {
      console.log('ℹ️ Coluna capacity já existe');
    }
    
    // Adicionar amenities (JSON)
    if (!colunasExistentes.includes('amenities')) {
      await pool.query("ALTER TABLE rooms ADD COLUMN amenities JSONB DEFAULT '[]'");
      console.log('✅ Coluna amenities adicionada');
    } else {
      console.log('ℹ️ Coluna amenities já existe');
    }
    
    // Adicionar images (JSON)
    if (!colunasExistentes.includes('images')) {
      await pool.query("ALTER TABLE rooms ADD COLUMN images JSONB DEFAULT '[]'");
      console.log('✅ Coluna images adicionada');
    } else {
      console.log('ℹ️ Coluna images já existe');
    }
    
    // Adicionar deleted_at (soft delete)
    if (!colunasExistentes.includes('deleted_at')) {
      await pool.query('ALTER TABLE rooms ADD COLUMN deleted_at TIMESTAMP');
      console.log('✅ Coluna deleted_at adicionada');
    } else {
      console.log('ℹ️ Coluna deleted_at já existe');
    }
    
    console.log('\n✅ Todas as colunas foram verificadas/adicionadas com sucesso!');
    await pool.end();
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    await pool.end();
  }
}

adicionarColunas();
