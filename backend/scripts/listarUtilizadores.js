const db = require('./config/database');

async function listarUtilizadores() {
  try {
    const result = await db.query('SELECT id, name, email, phone, role, is_active, created_at FROM users ORDER BY created_at');
    
    console.log('\n📋 UTILIZADORES CADASTRADOS:');
    console.log('=' .repeat(70));
    
    result.rows.forEach(u => {
      const status = u.is_active ? 'ATIVO' : 'INATIVO';
      console.log(`   Nome: ${u.name}`);
      console.log(`   Email: ${u.email}`);
      console.log(`   Telefone: ${u.phone || '-'}`);
      console.log(`   Perfil: ${u.role}`);
      console.log(`   Status: ${status}`);
      console.log(`   Criado: ${new Date(u.created_at).toLocaleString('pt-BR')}`);
      console.log('-'.repeat(70));
    });
    
    console.log(`\n📊 Total: ${result.rows.length} utilizadores`);
    process.exit();
  } catch(e) {
    console.error('Erro:', e.message);
    process.exit();
  }
}

listarUtilizadores();
