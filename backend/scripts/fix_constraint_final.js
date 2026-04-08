const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'hotel_paradise'
});

async function corrigirConstraint() {
  try {
    console.log('\n=== CORRIGINDO CONSTRAINT DEFINITIVAMENTE ===\n');
    
    // 1. Remover a constraint antiga se existir
    await pool.query('ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_status_check');
    console.log('✅ Constraint antiga removida');
    
    // 2. Criar nova constraint com todos os status
    await pool.query(`
      ALTER TABLE rooms 
      ADD CONSTRAINT rooms_status_check 
      CHECK (status IN ('available', 'occupied', 'maintenance', 'inactive'))
    `);
    console.log('✅ Nova constraint criada');
    
    // 3. Atualizar a coluna deleted_at se não existir
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'rooms' AND column_name = 'deleted_at'
    `);
    
    if (checkColumn.rows.length === 0) {
      await pool.query('ALTER TABLE rooms ADD COLUMN deleted_at TIMESTAMP');
      console.log('✅ Coluna deleted_at adicionada');
    } else {
      console.log('✅ Coluna deleted_at já existe');
    }
    
    // 4. Verificar se a constraint foi criada corretamente
    const result = await pool.query(`
      SELECT conname, pg_get_constraintdef(con.oid) as constraint_def
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      WHERE rel.relname = 'rooms' AND con.conname = 'rooms_status_check'
    `);
    
    console.log(`\n📋 Constraint atual: ${result.rows[0].constraint_def}`);
    
    await pool.end();
    console.log('\n✅ Correção concluída! Agora a exclusão deve funcionar.');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    await pool.end();
  }
}

corrigirConstraint();
