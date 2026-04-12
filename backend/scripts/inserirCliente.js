const db = require('../config/database');

async function inserirCliente() {
  try {
    const query = `
      INSERT INTO clientes (nome, email, telefone, documento)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE 
      SET nome = EXCLUDED.nome
      RETURNING id
    `;
    
    const result = await db.query(query, [
      'João Silva',
      'joao@email.com',
      '(11) 99999-9999',
      '123.456.789-00'
    ]);
    
    console.log('✅ Cliente criado/atualizado! ID:', result.rows[0].id);
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    process.exit();
  }
}

inserirCliente();
