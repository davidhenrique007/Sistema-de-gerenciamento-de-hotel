// backend/controllers/reservaController.js
const pool = require('../config/database');

// Catálogo de serviços — fonte única de verdade (igual ao frontend ServicosAdicionais.jsx)
const SERVICOS_CATALOGO = {
  cafe_manha: { nome: 'Café da manhã', preco: 300, tipo: 'por_noite' },
  spa: { nome: 'Spa & Bem-estar', preco: 2000, tipo: 'por_noite' },
  piscina: { nome: 'Piscina aquecida', preco: 1000, tipo: 'por_noite' },
  academia: { nome: 'Academia moderna', preco: 1500, tipo: 'por_noite' },
  translado: { nome: 'Translado aeroporto', preco: 1000, tipo: 'unico' },
  wifi_premium: { nome: 'Wi-Fi Premium', preco: 500, tipo: 'por_noite' },
};

// Função auxiliar para formatar moeda (uso interno) - DEFINIDA ANTES DE SER USADA
function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor);
}

class ReservaController {

  // =====================================================
  // CRIAR RESERVA (com múltiplos quartos e serviços)
  // =====================================================
  async criarReserva(req, res) {
    const {
      room_id, quartoId, room_ids,
      check_in, checkIn, check_out, checkOut,
      adults_count, adults, children_count, children,
      guest_name, guest_phone, guest_document, guest_email,
      payment_method,
      servicos
    } = req.body;

    let roomIds = [];
    if (Array.isArray(room_ids) && room_ids.length > 0) {
      roomIds = room_ids.map(String);
    } else if (room_id || quartoId) {
      roomIds = [String(room_id || quartoId)];
    }

    const dataCheckIn = check_in || checkIn;
    const dataCheckOut = check_out || checkOut;

    console.log('📝 Criando reserva:', { roomIds, dataCheckIn, dataCheckOut, guest_name, payment_method });
    console.log('🛎️  Serviços:', servicos);

    if (roomIds.length === 0 || !dataCheckIn || !dataCheckOut) {
      return res.status(400).json({
        error: true,
        message: 'Campos obrigatórios: room_id (ou room_ids), check_in, check_out'
      });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const quartosResult = await client.query(
        `SELECT id, room_number, type, status, price_per_night
         FROM rooms WHERE id = ANY($1::uuid[])`,
        [roomIds]
      );

      if (quartosResult.rows.length !== roomIds.length) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: true, message: 'Um ou mais quartos não encontrados' });
      }

      const quartoOcupado = quartosResult.rows.find(q => q.status !== 'available');
      if (quartoOcupado) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          error: true,
          message: `Quarto ${quartoOcupado.room_number} já está ocupado. Selecione outro.`
        });
      }

      let guestId;
      const guestExistente = await client.query(
        'SELECT id FROM guests WHERE phone = $1', [guest_phone]
      );
      if (guestExistente.rows.length > 0) {
        guestId = guestExistente.rows[0].id;
        await client.query(
          'UPDATE guests SET name=$1, email=$2, document=$3, updated_at=NOW() WHERE id=$4',
          [guest_name, guest_email, guest_document, guestId]
        );
      } else {
        const novoGuest = await client.query(
          'INSERT INTO guests (name, phone, email, document) VALUES ($1,$2,$3,$4) RETURNING id',
          [guest_name, guest_phone, guest_email, guest_document]
        );
        guestId = novoGuest.rows[0].id;
      }

      const userResult = await client.query("SELECT id FROM users WHERE role='admin' LIMIT 1");
      const userId = userResult.rows[0]?.id;
      if (!userId) {
        await client.query('ROLLBACK');
        return res.status(500).json({ error: true, message: 'Nenhum admin encontrado' });
      }

      const noites = Math.max(1, Math.ceil(
        (new Date(dataCheckOut) - new Date(dataCheckIn)) / (1000 * 60 * 60 * 24)
      ));

      const totalQuartos = quartosResult.rows.reduce(
        (soma, q) => soma + parseFloat(q.price_per_night), 0
      ) * noites;

      const servicosIds = Array.isArray(servicos) ? servicos : [];
      let totalServicos = 0;
      const servicosParaGuardar = [];

      for (const sid of servicosIds) {
        const cat = SERVICOS_CATALOGO[sid];
        if (cat) {
          const precoTotal = cat.tipo === 'por_noite' ? cat.preco * noites : cat.preco;
          totalServicos += precoTotal;
          servicosParaGuardar.push({
            nome: cat.nome, tipo: cat.tipo,
            preco: cat.preco, precoTotal
          });
        }
      }

      const basePrice = parseFloat((totalQuartos + totalServicos).toFixed(2));
      const taxAmount = parseFloat((basePrice * 0.05).toFixed(2));
      const totalPrice = parseFloat((basePrice + taxAmount).toFixed(2));

      console.log(`💰 Quartos: ${totalQuartos} | Serviços: ${totalServicos} | Base: ${basePrice} | Taxa: ${taxAmount} | TOTAL: ${totalPrice}`);

      const novaReserva = await client.query(`
        INSERT INTO reservations (
          guest_id, room_id, user_id, check_in, check_out,
          adults_count, children_count, rooms_count,
          base_price, tax_amount, total_price,
          payment_method, status, payment_status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'pending','pending')
        RETURNING *
      `, [
        guestId, roomIds[0], userId,
        dataCheckIn, dataCheckOut,
        adults_count || adults || 1,
        children_count || children || 0,
        roomIds.length,
        basePrice, taxAmount, totalPrice,
        payment_method || 'dinheiro'
      ]);

      const reserva = novaReserva.rows[0];

      for (const rId of roomIds) {
        await client.query(
          `INSERT INTO reservation_rooms (reservation_id, room_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [reserva.id, rId]
        );
      }

      for (const s of servicosParaGuardar) {
        await client.query(`
          INSERT INTO reservation_services
            (reservation_id, service_name, service_type, price_per_unit, nights, total_price)
          VALUES ($1,$2,$3,$4,$5,$6)
        `, [reserva.id, s.nome, s.tipo, s.preco, noites, s.precoTotal]);
      }

      await client.query(
        'UPDATE rooms SET status=$1, updated_at=NOW() WHERE id = ANY($2::uuid[])',
        ['occupied', roomIds]
      );

      await client.query('COMMIT');

      console.log(`✅ ${reserva.reservation_code} | ${roomIds.length} quarto(s) | ${servicosParaGuardar.length} serviço(s) | ${totalPrice} MTn`);

      return res.status(201).json({
        success: true,
        message: 'Reserva criada com sucesso',
        data: {
          ...reserva,
          noites,
          rooms_count: roomIds.length,
          quartos: quartosResult.rows.map(q => ({
            id: q.id,
            room_number: q.room_number,
            type: q.type,
            price_per_night: q.price_per_night
          }))
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Erro ao criar reserva:', error.message);
      return res.status(500).json({
        error: true,
        message: 'Erro interno ao processar reserva',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    } finally {
      client.release();
    }
  }

  // =====================================================
  // BUSCAR RESERVA POR ID OU CÓDIGO
  // =====================================================
  async buscarReserva(req, res) {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        SELECT r.*, g.name as guest_name, g.email as guest_email, g.phone as guest_phone,
               rm.room_number, rm.type as room_type, rm.price_per_night, rm.capacity_adults,
               COALESCE(r.rooms_count, 1) as rooms_count
        FROM reservations r
        LEFT JOIN guests g  ON r.guest_id = g.id
        LEFT JOIN rooms  rm ON r.room_id  = rm.id
        WHERE r.reservation_code = $1 OR r.id::text = $1
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: true, message: 'Reserva não encontrada' });
      }

      const reserva = result.rows[0];

      const servicosResult = await pool.query(`
        SELECT service_name, service_type, price_per_unit, nights, total_price
        FROM reservation_services WHERE reservation_id = $1 ORDER BY created_at
      `, [reserva.id]);

      return res.json({
        success: true,
        data: { ...reserva, servicos: servicosResult.rows }
      });

    } catch (error) {
      console.error('Erro ao buscar reserva:', error);
      return res.status(500).json({ error: true, message: 'Erro ao buscar reserva' });
    }
  }

  // =====================================================
  // LISTAR RESERVAS DO CLIENTE (Dashboard)
  // =====================================================
  async listarReservasCliente(req, res) {
    try {
      const { clienteId } = req.params;

      console.log(`🔍 Buscando reservas para o cliente: ${clienteId}`);

      const reservas = await pool.query(`
        SELECT 
          r.*,
          rm.room_number,
          rm.type as room_type,
          rm.price_per_night,
          g.name as guest_name,
          g.email as guest_email,
          g.phone as guest_phone,
          COALESCE(r.rooms_count, 1) as rooms_count,
          r.payment_method,
          r.status,
          r.payment_status,
          r.total_price,
          r.check_in,
          r.check_out,
          r.reservation_code,
          r.created_at
        FROM reservations r
        JOIN rooms rm ON r.room_id = rm.id
        JOIN guests g ON r.guest_id = g.id
        WHERE r.guest_id = $1
        ORDER BY r.created_at DESC
      `, [clienteId]);

      console.log(`✅ Encontradas ${reservas.rows.length} reservas para o cliente`);

      for (let reserva of reservas.rows) {
        const servicos = await pool.query(`
          SELECT service_name, service_type, price_per_unit, nights, total_price
          FROM reservation_services
          WHERE reservation_id = $1
          ORDER BY created_at
        `, [reserva.id]);
        reserva.servicos = servicos.rows;
      }

      res.json({
        success: true,
        data: reservas.rows,
        total: reservas.rows.length
      });
    } catch (error) {
      console.error('❌ Erro ao listar reservas do cliente:', error);
      res.status(500).json({
        error: true,
        message: 'Erro ao listar reservas',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // =====================================================
  // CANCELAR RESERVA
  // =====================================================
  async cancelarReserva(req, res) {
    const { id } = req.params;
    const { motivo } = req.body;

    try {
      console.log(`Cancelando reserva: ${id}`);

      // Buscar a reserva pelo código ou ID
      const reserva = await pool.query(
        "SELECT * FROM reservations WHERE reservation_code = $1 OR id::text = $1",
        [id]
      );

      if (reserva.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Reserva não encontrada' });
      }

      const reservaData = reserva.rows[0];

      // Cancelar a reserva
      await pool.query(
        "UPDATE reservations SET status = 'cancelled', cancellation_reason = $1, cancellation_date = NOW(), updated_at = NOW() WHERE id = $2",
        [motivo || 'Cancelado pelo cliente', reservaData.id]
      );

      // Liberar o quarto
      await pool.query(
        "UPDATE rooms SET status = 'available', updated_at = NOW() WHERE id = $1",
        [reservaData.room_id]
      );

      console.log(`✅ Reserva ${reservaData.reservation_code} cancelada`);

      res.json({
        success: true,
        message: 'Reserva cancelada com sucesso',
        data: { reservation_code: reservaData.reservation_code, status: 'cancelled' }
      });

    } catch (error) {
      console.error('Erro ao cancelar:', error);
      res.status(500).json({ success: false, message: 'Erro ao cancelar reserva' });
    }
  }

  // =====================================================
  // ALTERAR RESERVA - VERSÃO DEFINITIVA COM CAST CORRETO
  // =====================================================
  async alterarReserva(req, res) {
    const { id } = req.params;
    const { room_id, total_price, check_in, check_out } = req.body;

    try {
      console.log('📝 Alterando reserva:', { id, room_id, total_price, check_in, check_out });

      // 1. Buscar a reserva atual - usando id::text para evitar erro de tipo
      const reservaQuery = await pool.query(
        `SELECT r.*, rm.room_number, rm.type as room_type, rm.price_per_night 
         FROM reservations r
         JOIN rooms rm ON r.room_id = rm.id
         WHERE r.id::text = $1 OR r.reservation_code = $1`,
        [id]
      );

      if (reservaQuery.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Reserva não encontrada'
        });
      }

      const reserva = reservaQuery.rows[0];

      // 2. Se for troca de quarto
      if (room_id && room_id !== reserva.room_id) {
        console.log(`🔄 Trocando quarto: ${reserva.room_id} → ${room_id}`);

        // 2.1 Verificar se o novo quarto existe e está disponível - usando id::text
        const novoQuartoQuery = await pool.query(
          `SELECT id, room_number, type, price_per_night, status 
           FROM rooms 
           WHERE id::text = $1`,
          [room_id]
        );

        if (novoQuartoQuery.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Quarto não encontrado'
          });
        }

        const novoQuarto = novoQuartoQuery.rows[0];

        if (novoQuarto.status !== 'available') {
          return res.status(409).json({
            success: false,
            message: `Quarto ${novoQuarto.room_number} não está disponível no momento`
          });
        }

        // 2.2 Calcular o novo valor
        const noites = Math.ceil((new Date(reserva.check_out) - new Date(reserva.check_in)) / (1000 * 60 * 60 * 24));
        const novoValorBase = parseFloat(novoQuarto.price_per_night) * noites * reserva.rooms_count;
        const novoValorTotal = (novoValorBase * 1.05).toFixed(2);

        // 2.3 Iniciar transação
        await pool.query('BEGIN');

        // 2.4 Liberar o quarto antigo
        await pool.query(
          `UPDATE rooms 
           SET status = 'available', updated_at = NOW() 
           WHERE id::text = $1`,
          [reserva.room_id]
        );

        // 2.5 Ocupar o novo quarto
        await pool.query(
          `UPDATE rooms 
           SET status = 'occupied', updated_at = NOW() 
           WHERE id::text = $1`,
          [room_id]
        );

        // 2.6 Atualizar a reserva
        const valorFinal = total_price || novoValorTotal;

        await pool.query(
          `UPDATE reservations 
           SET room_id = $1::uuid, 
               total_price = $2,
               updated_at = NOW()
           WHERE id::text = $3`,
          [room_id, valorFinal, reserva.id]
        );

        await pool.query('COMMIT');

        console.log(`✅ Quarto alterado: ${reserva.room_number} → ${novoQuarto.room_number}`);
        console.log(`💰 Valor antigo: ${reserva.total_price} → Novo: ${valorFinal}`);

        return res.json({
          success: true,
          message: `Quarto alterado para ${novoQuarto.room_number} - ${novoQuarto.type}`,
          data: {
            room_id,
            room_number: novoQuarto.room_number,
            room_type: novoQuarto.type,
            total_price: valorFinal
          }
        });
      }

      // 3. Se for alteração de datas
      if (check_in && check_out) {
        console.log(`📅 Alterando datas: ${reserva.check_in} → ${check_in} até ${check_out}`);

        // 3.1 Verificar disponibilidade
        const conflitoQuery = await pool.query(
          `SELECT r.id, r.reservation_code, r.check_in, r.check_out
           FROM reservations r
           WHERE r.room_id::text = $1
             AND r.id::text != $2
             AND r.status NOT IN ('cancelled', 'finalized')
             AND r.check_in < $4
             AND r.check_out > $3`,
          [reserva.room_id, reserva.id, check_in, check_out]
        );

        if (conflitoQuery.rows.length > 0) {
          return res.status(409).json({
            success: false,
            message: 'Quarto não disponível para as novas datas'
          });
        }

        // 3.2 Calcular novo valor
        const noitesAtuais = Math.ceil((new Date(reserva.check_out) - new Date(reserva.check_in)) / (1000 * 60 * 60 * 24));
        const noitesNovas = Math.ceil((new Date(check_out) - new Date(check_in)) / (1000 * 60 * 60 * 24));

        const precoPorNoite = reserva.total_price / reserva.rooms_count / noitesAtuais;
        const novoBase = precoPorNoite * noitesNovas * reserva.rooms_count;
        const novoTotal = (novoBase * 1.05).toFixed(2);

        // 3.3 Atualizar a reserva
        await pool.query(
          `UPDATE reservations 
           SET check_in = $1, 
               check_out = $2, 
               total_price = $3,
               updated_at = NOW()
           WHERE id::text = $4`,
          [check_in, check_out, novoTotal, reserva.id]
        );

        console.log(`✅ Datas alteradas: ${noitesAtuais} noites → ${noitesNovas} noites`);
        console.log(`💰 Novo valor: ${novoTotal}`);

        return res.json({
          success: true,
          message: 'Datas alteradas com sucesso',
          data: {
            check_in,
            check_out,
            nights: noitesNovas,
            total_price: novoTotal
          }
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Nenhuma alteração solicitada'
      });

    } catch (error) {
      await pool.query('ROLLBACK').catch(() => { });
      console.error('❌ Erro ao alterar reserva:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao processar alteração',
        error: error.message
      });
    }
  }

  // =====================================================
  // REENVIAR RECIBO
  // =====================================================
  async reenviarRecibo(req, res) {
    const { id } = req.params;

    try {
      console.log(`🔍 Buscando reserva para reenviar recibo: ${id}`);

      const reserva = await pool.query(`
        SELECT r.*, 
               g.name as guest_name, 
               g.email as guest_email, 
               g.phone as guest_phone,
               rm.room_number, 
               rm.type as room_type,
               rm.price_per_night
        FROM reservations r
        JOIN guests g ON r.guest_id = g.id
        JOIN rooms rm ON r.room_id = rm.id
        WHERE r.reservation_code = $1 OR r.id::text = $1
      `, [id]);

      if (reserva.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Reserva não encontrada' });
      }

      const reservaData = reserva.rows[0];

      const servicos = await pool.query(`
        SELECT service_name, service_type, price_per_unit, nights, total_price
        FROM reservation_services
        WHERE reservation_id = $1
      `, [reservaData.id]);

      reservaData.servicos = servicos.rows;

      console.log(`✅ Recibo preparado para ${reservaData.reservation_code}`);

      res.json({
        success: true,
        message: 'Recibo gerado com sucesso',
        data: reservaData
      });

    } catch (error) {
      console.error('❌ Erro ao reenviar recibo:', error);
      res.status(500).json({ success: false, message: 'Erro ao reenviar recibo' });
    }
  }

  // =====================================================
  // BUSCAR QUARTOS DISPONÍVEIS
  // =====================================================
  async buscarQuartosDisponiveis(req, res) {
    try {
      const { tipo } = req.query;
      let query = 'SELECT * FROM rooms WHERE status = $1';
      const params = ['available'];
      if (tipo) { query += ' AND type = $2'; params.push(tipo); }
      query += ' ORDER BY room_number';
      const result = await pool.query(query, params);
      res.json({ success: true, data: result.rows, total: result.rows.length });
    } catch (error) {
      console.error('Erro ao buscar quartos:', error);
      res.status(500).json({ error: true, message: 'Erro ao buscar quartos disponíveis' });
    }
  }

  // =====================================================
  // CONFIRMAR PAGAMENTO
  // =====================================================
  async confirmarPagamento(req, res) {
    const { id } = req.params;
    const { payment_method } = req.body;
    try {
      const result = await pool.query(`
        UPDATE reservations
        SET payment_status = 'paid', status = 'confirmed',
            payment_method = $2, payment_confirmed_at = NOW(), updated_at = NOW()
        WHERE reservation_code = $1 OR id::text = $1
        RETURNING *
      `, [id, payment_method || 'mpesa']);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: true, message: 'Reserva não encontrada' });
      }

      return res.json({ success: true, message: 'Pagamento confirmado', data: result.rows[0] });
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      return res.status(500).json({ error: true, message: 'Erro ao confirmar pagamento' });
    }
  }
}

module.exports = new ReservaController();