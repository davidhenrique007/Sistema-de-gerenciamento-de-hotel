const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'hotel_paradise'
});

async function alterarStatusConstraint() {
  try {
    console.log('\n=== ALTERANDO CONSTRAINT DA TABELA ROOMS ===\n');
    
    // Primeiro, remover a constraint antiga
    try {
      await pool.query('ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_status_check');
      console.log('✅ Constraint antiga removida');
    } catch (err) {
      console.log('⚠️ Não foi possível remover constraint:', err.message);
    }
    
    // Adicionar nova constraint com os valores permitidos
    try {
      await pool.query(`
        ALTER TABLE rooms 
        ADD CONSTRAINT rooms_status_check 
        CHECK (status IN ('available', 'occupied', 'maintenance', 'inactive'))
      `);
      console.log('✅ Nova constraint adicionada com status: available, occupied, maintenance, inactive');
    } catch (err) {
      console.log('⚠️ Erro ao adicionar constraint:', err.message);
    }
    
    // Verificar a constraint atual
    const result = await pool.query(`
      SELECT conname, pg_get_constraintdef(oid) as constraint_def
      FROM pg_constraint
      WHERE conrelid = 'rooms'::regclass AND conname = 'rooms_status_check'
    `);
    
    if (result.rows.length > 0) {
      console.log(`\n📋 Constraint atual: ${result.rows[0].constraint_def}`);
    }
    
    await pool.end();
    console.log('\n✅ Tabela rooms atualizada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    await pool.end();
  }
}

alterarStatusConstraint();
