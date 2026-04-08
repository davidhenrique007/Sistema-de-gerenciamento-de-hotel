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
    console.log('\n=== CORRIGINDO CONSTRAINT DA TABELA ROOMS ===\n');
    
    // 1. Remover a constraint antiga
    await pool.query('ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_status_check');
    console.log('✅ Constraint antiga removida');
    
    // 2. Criar nova constraint com todos os status permitidos
    await pool.query(`
      ALTER TABLE rooms 
      ADD CONSTRAINT rooms_status_check 
      CHECK (status IN ('available', 'occupied', 'maintenance', 'inactive'))
    `);
    console.log('✅ Nova constraint criada com: available, occupied, maintenance, inactive');
    
    // 3. Atualizar os quartos que estão com status 'inactive' (se houver)
    await pool.query(`
      UPDATE rooms 
      SET status = 'inactive' 
      WHERE deleted_at IS NOT NULL AND status != 'inactive'
    `);
    console.log('✅ Quartos com deleted_at atualizados para status inactive');
    
    // 4. Verificar a constraint atual
    const result = await pool.query(`
      SELECT conname, pg_get_constraintdef(con.oid) as constraint_def
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      WHERE rel.relname = 'rooms' AND con.conname = 'rooms_status_check'
    `);
    
    if (result.rows.length > 0) {
      console.log(`\n📋 Constraint atual: ${result.rows[0].constraint_def}`);
    }
    
    // 5. Verificar os status existentes na tabela
    const statusResult = await pool.query('SELECT DISTINCT status, COUNT(*) as total FROM rooms GROUP BY status');
    console.log('\n📊 Status atuais na tabela:');
    statusResult.rows.forEach(r => {
      console.log(`   - ${r.status}: ${r.total} quartos`);
    });
    
    await pool.end();
    console.log('\n✅ Correção concluída!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    await pool.end();
  }
}

corrigirConstraint();
