const db = require('../config/database');

async function inserirReserva() {
  try {
    const cliente = await db.query('SELECT id FROM clientes LIMIT 1');
    const quarto = await db.query('SELECT id FROM quartos LIMIT 1');
    
    if (cliente.rows.length === 0) {
      console.log('❌ Nenhum cliente encontrado! Execute node scripts/inserirCliente.js primeiro');
      process.exit();
    }
    
    if (quarto.rows.length === 0) {
      console.log('❌ Nenhum quarto encontrado! Execute node scripts/inserirQuarto.js primeiro');
      process.exit();
    }
    
    const codigo = 'RES' + Date.now();
    const hoje = new Date();
    const checkin = new Date(hoje);
    checkin.setDate(hoje.getDate() + 1);
    const checkout = new Date(hoje);
    checkout.setDate(hoje.getDate() + 3);
    
    const query = `
      INSERT INTO reservas (
        codigo_reserva,
        cliente_id,
        quarto_id,
        data_checkin,
        data_checkout,
        valor_total,
        status_reserva,
        status_pagamento,
        metodo_pagamento
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;
    
    const result = await db.query(query, [
      codigo,
      cliente.rows[0].id,
      quarto.rows[0].id,
      checkin.toISOString().split('T')[0],
      checkout.toISOString().split('T')[0],
      3000.00,
      'CONFIRMADA',
      'PENDENTE',
      'CARTAO_CREDITO'
    ]);
    
    console.log('✅ Reserva criada com sucesso!');
    console.log('   ID:', result.rows[0].id);
    console.log('   Código:', codigo);
    console.log('   Cliente ID:', cliente.rows[0].id);
    console.log('   Quarto ID:', quarto.rows[0].id);
    console.log('   Check-in:', checkin.toISOString().split('T')[0]);
    console.log('   Check-out:', checkout.toISOString().split('T')[0]);
    
  } catch (error) {
    console.error('❌ Erro ao criar reserva:', error.message);
  } finally {
    process.exit();
  }
}

inserirReserva();
