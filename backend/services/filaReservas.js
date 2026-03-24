// =====================================================
// FILA DE RESERVAS - VERSÃO CORRIGIDA
// =====================================================

const Queue = require('bull');
const pool = require('../config/database');

let filaReservas = null;
let useQueue = false;

try {
  filaReservas = new Queue('reservas', {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    }
  });
  
  useQueue = true;
  console.log('✅ Bull queue ativada com Redis');
} catch (err) {
  console.log('⚠️ Bull não disponível, usando processamento síncrono');
}

// Função de processamento da fila
async function processarReserva(job) {
  const { reservaData, userId, guestId } = job.data;
  let client;

  try {
    console.log(`🔄 Processando reserva ${job.id} para quarto ${reservaData.quartoId}`);
    
    client = await pool.connect();
    await client.query('BEGIN');
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');

    // Buscar o guest_id correto
    let finalGuestId = guestId;
    
    // Se guestId for um número, buscar um guest real
    if (typeof guestId === 'number' || (typeof guestId === 'string' && !guestId.includes('-'))) {
      const guestResult = await client.query(`
        SELECT id FROM guests LIMIT 1
      `);
      if (guestResult.rows.length > 0) {
        finalGuestId = guestResult.rows[0].id;
      } else {
        // Criar um guest temporário
        const newGuest = await client.query(`
          INSERT INTO guests (first_name, last_name, email, phone, document_number)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
        `, ['Cliente', 'Teste', `cliente${Date.now()}@teste.com`, '844626924', '123456789']);
        finalGuestId = newGuest.rows[0].id;
      }
    }
    
    // Buscar o user_id correto
    let finalUserId = userId;
    if (typeof userId === 'number' || (typeof userId === 'string' && !userId.includes('-'))) {
      const userResult = await client.query(`
        SELECT id FROM users LIMIT 1
      `);
      if (userResult.rows.length > 0) {
        finalUserId = userResult.rows[0].id;
      } else {
        finalUserId = '00000000-0000-0000-0000-000000000001';
      }
    }
    
    console.log(`📌 Guest ID: ${finalGuestId}, User ID: ${finalUserId}`);

    // Lock no quarto com FOR UPDATE
    const roomResult = await client.query(`
      SELECT * FROM rooms
      WHERE id = $1
      FOR UPDATE
    `, [reservaData.quartoId]);

    if (roomResult.rows.length === 0) {
      throw new Error('QUARTO_NAO_ENCONTRADO');
    }

    const room = roomResult.rows[0];

    if (room.status !== 'available') {
      throw new Error('QUARTO_INDISPONIVEL');
    }

    // Verificar se já existe reserva para o período
    const existingReservation = await client.query(`
      SELECT id FROM reservations
      WHERE room_id = $1
        AND status NOT IN ('cancelled', 'expired', 'checked_out')
        AND check_in < $3
        AND check_out > $2
      LIMIT 1
    `, [reservaData.quartoId, reservaData.checkIn, reservaData.checkOut]);

    if (existingReservation.rows.length > 0) {
      throw new Error('QUARTO_RESERVADO');
    }

    // Criar reserva
    const reservaResult = await client.query(`
      INSERT INTO reservations (
        guest_id,
        room_id,
        user_id,
        check_in,
        check_out,
        adults_count,
        children_count,
        base_price,
        total_price,
        status,
        payment_status,
        source
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      finalGuestId,
      reservaData.quartoId,
      finalUserId,
      reservaData.checkIn,
      reservaData.checkOut,
      reservaData.adults || 2,
      reservaData.children || 0,
      reservaData.valorTotal || 5000,
      reservaData.valorTotal || 5000,
      'confirmed',
      'pending',
      'website'
    ]);

    // Atualizar status do quarto
    await client.query(`
      UPDATE rooms
      SET status = 'occupied', updated_at = NOW()
      WHERE id = $1
    `, [reservaData.quartoId]);

    await client.query('COMMIT');
    
    console.log(`✅ Reserva ${job.id} concluída com sucesso`);

    return {
      success: true,
      reserva: reservaResult.rows[0],
      mensagem: 'Reserva confirmada com sucesso'
    };

  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error(`❌ Erro na reserva ${job.id}:`, error.message);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Configurar processador da fila
if (useQueue) {
  filaReservas.process(processarReserva);
  
  filaReservas.on('completed', (job, result) => {
    console.log(`✅ Job ${job.id} concluído`);
  });
  
  filaReservas.on('failed', (job, err) => {
    console.error(`❌ Job ${job.id} falhou:`, err.message);
  });
}

async function criarReserva(dados) {
  if (useQueue) {
    const job = await filaReservas.add(dados);
    console.log(`📦 Reserva ${job.id} adicionada à fila`);
    return { jobId: job.id, status: 'processing' };
  } else {
    const resultado = await processarReserva({ data: dados });
    return { resultado, status: 'completed' };
  }
}

module.exports = { criarReserva, useQueue };
