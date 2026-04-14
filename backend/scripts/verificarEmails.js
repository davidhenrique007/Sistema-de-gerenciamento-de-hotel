const db = require('./config/database');

async function verificarEmails() {
  try {
    const result = await db.query('SELECT id, name, email, role FROM users ORDER BY email');
    
    console.log('\n📋 EMAILS CADASTRADOS NO SISTEMA:');
    console.log('=' .repeat(60));
    
    result.rows.forEach(u => {
      console.log(`   ${u.email} | ${u.name} | ${u.role}`);
    });
    
    console.log('=' .repeat(60));
    console.log(`Total: ${result.rows.length} utilizadores`);
    
    // Verificar especificamente o email
    const emailProcurado = 'florencia@hotelparadise.com';
    const encontrado = result.rows.some(u => u.email.toLowerCase() === emailProcurado);
    
    if (encontrado) {
      console.log(`\n⚠️ O email ${emailProcurado} JÁ EXISTE no sistema!`);
    } else {
      console.log(`\n✅ O email ${emailProcurado} está disponível!`);
    }
    
    process.exit();
  } catch(e) {
    console.error('Erro:', e.message);
    process.exit();
  }
}

verificarEmails();
