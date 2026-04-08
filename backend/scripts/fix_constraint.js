const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'hotel_paradise'
});

async function corrigir() {
  try {
    console.log('=== CORRIGINDO CONSTRAINT ===\n');
    
    // 1. Remover constraint antiga
    await pool.query('ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_status_check');
    console.log('✅ Constraint antiga removida');
    
    // 2. Criar nova constraint
    await pool.query(`
      ALTER TABLE rooms 
      ADD CONSTRAINT rooms_status_check 
      CHECK (status IN ('available', 'occupied', 'maintenance', 'inactive'))
    `);
    console.log('✅ Nova constraint criada');
    
    // 3. Verificar
    const result = await pool.query(`
      SELECT conname, pg_get_constraintdef(con.oid) as constraint_def
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      WHERE rel.relname = 'rooms' AND con.conname = 'rooms_status_check'
    `);
    
    console.log(`\n📋 ${result.rows[0].constraint_def}`);
    
    await pool.end();
    console.log('\n✅ Pronto! Agora a exclusão deve funcionar.');
    
  } catch (err) {
    console.error('Erro:', err.message);
    await pool.end();
  }
}

corrigir();
