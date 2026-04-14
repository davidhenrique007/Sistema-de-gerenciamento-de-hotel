const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./config/database');

async function testarCriacao() {
  try {
    console.log('🔧 Testando criação de utilizador...');
    
    const name = 'Estrela Henrique';
    const email = 'estrela@hotelparadise.com';
    const phone = '844626924';
    const role = 'receptionist';
    const password = '123456';
    
    // Verificar se já existe
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (existing.rows.length > 0) {
      console.log(`⚠️ Utilizador ${email} já existe!`);
      console.log('   Removendo para recriar...');
      await db.query('DELETE FROM users WHERE email = $1', [email]);
    }
    
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const userId = uuidv4();
    
    await db.query(`
      INSERT INTO users (id, name, email, phone, role, password_hash, is_active, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
    `, [userId, name, email, phone, role, password_hash]);
    
    console.log(`\n✅ Utilizador criado com sucesso!`);
    console.log(`   ID: ${userId}`);
    console.log(`   Nome: ${name}`);
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${password}`);
    
    // Verificar se foi inserido
    const verify = await db.query('SELECT id, name, email, role FROM users WHERE email = $1', [email]);
    console.log(`\n📋 Verificação: ${verify.rows.length} utilizador(es) encontrado(s)`);
    
    process.exit();
  } catch(e) {
    console.error('❌ Erro:', e.message);
    process.exit();
  }
}

testarCriacao();
