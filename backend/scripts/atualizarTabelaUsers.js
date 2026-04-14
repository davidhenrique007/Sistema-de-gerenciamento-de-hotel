const db = require('./config/database');

async function atualizarTabelaUsers() {
  try {
    console.log('🔧 Atualizando tabela users...');
    
    // Adicionar coluna phone se não existir
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50)');
    console.log('✅ Coluna phone adicionada');
    
    // Adicionar coluna created_by se não existir
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by UUID');
    console.log('✅ Coluna created_by adicionada');
    
    // Adicionar coluna updated_by se não existir
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_by UUID');
    console.log('✅ Coluna updated_by adicionada');
    
    // Adicionar coluna must_change_password se não existir
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT true');
    console.log('✅ Coluna must_change_password adicionada');
    
    // Adicionar coluna password_reset_token se não existir
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255)');
    console.log('✅ Coluna password_reset_token adicionada');
    
    // Adicionar coluna password_reset_expires se não existir
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP');
    console.log('✅ Coluna password_reset_expires adicionada');
    
    console.log('\n✅ Tabela users atualizada com sucesso!');
    
    // Verificar estrutura final
    const result = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 ESTRUTURA FINAL DA TABELA USERS:');
    result.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    process.exit();
  } catch(e) {
    console.error('❌ Erro:', e.message);
    process.exit();
  }
}

atualizarTabelaUsers();
