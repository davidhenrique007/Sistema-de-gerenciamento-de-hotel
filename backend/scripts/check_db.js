const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'hotel_paradise'
});

async function verificar() {
  try {
    // Verificar se a coluna deleted_at existe
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'rooms' AND column_name = 'deleted_at'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Coluna deleted_at já existe');
    } else {
      console.log('❌ Coluna deleted_at NÃO existe!');
      console.log('Adicionando coluna deleted_at...');
      await pool.query('ALTER TABLE rooms ADD COLUMN deleted_at TIMESTAMP');
      console.log('✅ Coluna deleted_at adicionada com sucesso');
    }
    
    // Verificar a constraint
    const constraint = await pool.query(`
      SELECT conname 
      FROM pg_constraint 
      WHERE conrelid = 'rooms'::regclass AND conname = 'rooms_status_check'
    `);
    
    if (constraint.rows.length > 0) {
      console.log('✅ Constraint rooms_status_check existe');
    } else {
      console.log('⚠️ Constraint não encontrada, recriando...');
      await pool.query(`
        ALTER TABLE rooms 
        ADD CONSTRAINT rooms_status_check 
        CHECK (status IN ('available', 'occupied', 'maintenance', 'inactive'))
      `);
      console.log('✅ Constraint recriada');
    }
    
    await pool.end();
    
  } catch (err) {
    console.error('Erro:', err.message);
    await pool.end();
  }
}

verificar();
