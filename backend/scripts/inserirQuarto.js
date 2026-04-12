const db = require('../config/database');

async function inserirQuarto() {
  try {
    const query = `
      INSERT INTO quartos (numero, tipo, andar, valor_diaria, capacidade, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (numero) DO UPDATE 
      SET tipo = EXCLUDED.tipo
      RETURNING id
    `;
    
    const result = await db.query(query, [
      '101',
      'Standard',
      1,
      3000.00,
      2,
      'DISPONIVEL'
    ]);
    
    console.log('✅ Quarto criado/atualizado! ID:', result.rows[0].id);
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    process.exit();
  }
}

inserirQuarto();
