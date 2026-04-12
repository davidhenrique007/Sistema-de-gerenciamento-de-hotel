const db = require('./config/database');

async function inserirReservaTeste() {
  try {
    // Buscar um cliente existente
    const cliente = await db.query('SELECT id FROM clientes LIMIT 1');
    const quarto = await db.query('SELECT id FROM quartos LIMIT 1');
    
    if (cliente.rows.length === 0) {
      console.log('❌ Nenhum cliente encontrado. Cadastre um cliente primeiro.');
      return;
    }
    
    if (quarto.rows.length === 0) {
      console.log('❌ Nenhum quarto encontrado. Cadastre um quarto primeiro.');
      return;
    }
    
    const codigo = 'RES' + Date.now();
    const hoje = new Date();
    const checkin = new Date(hoje.setDate(hoje.getDate() + 1)).toISOString().split('T')[0];
    const checkout = new Date(hoje.setDate(hoje.getDate() + 2)).toISOString().split('T')[0];
    
    await db.query(`
      INSERT INTO reservas (
        codigo_reserva, 
        cliente_id, 
        quarto_id, 
        data_checkin, 
        data_checkout, 
        valor_total, 
        status_reserva, 
        status_pagamento
      ) VALUES ($1, $2, $3, $4, $5, 3000, 'CONFIRMADA', 'PENDENTE')
    `, [codigo, cliente.rows[0].id, quarto.rows[0].id, checkin, checkout]);
    
    console.log('✅ Reserva de teste criada!');
    console.log('   Código:', codigo);
    console.log('   Cliente ID:', cliente.rows[0].id);
    console.log('   Quarto ID:', quarto.rows[0].id);
    console.log('   Check-in:', checkin);
    console.log('   Check-out:', checkout);
    
  } catch(e) {
    console.error('❌ Erro ao criar reserva:', e.message);
  } finally {
    process.exit();
  }
}

inserirReservaTeste();
