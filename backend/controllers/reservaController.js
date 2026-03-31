// backend/controllers/reservaController.js
const pool = require('../config/database');

// Catálogo de serviços — fonte única de verdade (igual ao frontend ServicosAdicionais.jsx)
const SERVICOS_CATALOGO = {
  cafe_manha:   { nome: 'Café da manhã',       preco: 300,   tipo: 'por_noite' },
  spa:          { nome: 'Spa & Bem-estar',      preco: 2000,  tipo: 'por_noite' },
  piscina:      { nome: 'Piscina aquecida',     preco: 1000,  tipo: 'por_noite' },
  academia:     { nome: 'Academia moderna',     preco: 1500,  tipo: 'por_noite' },
  translado:    { nome: 'Translado aeroporto',  preco: 1000,  tipo: 'unico'     },
  wifi_premium: { nome: 'Wi-Fi Premium',        preco: 500,   tipo: 'por_noite' },
};

class ReservaController {

  async criarReserva(req, res) {
    const {
      room_id, quartoId, room_ids,
      check_in, checkIn, check_out, checkOut,
      adults_count, adults, children_count, children,
      guest_name, guest_phone, guest_document, guest_email,
      payment_method,
      servicos // array de IDs: ['cafe_manha', 'piscina', ...]
    } = req.body;

    let roomIds = [];
    if (Array.isArray(room_ids) && room_ids.length > 0) {
      roomIds = room_ids.map(String);
    } else if (room_id || quartoId) {
      roomIds = [String(room_id || quartoId)];
    }

    const dataCheckIn  = check_in  || checkIn;
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

      // ── Verificar quartos ────────────────────────────────────────────────
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

      // ── Hóspede ──────────────────────────────────────────────────────────
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

      // ── Admin ────────────────────────────────────────────────────────────
      const userResult = await client.query("SELECT id FROM users WHERE role='admin' LIMIT 1");
      const userId = userResult.rows[0]?.id;
      if (!userId) {
        await client.query('ROLLBACK');
        return res.status(500).json({ error: true, message: 'Nenhum admin encontrado' });
      }

      // ── Cálculo automático ───────────────────────────────────────────────
      const noites = Math.max(1, Math.ceil(
        (new Date(dataCheckOut) - new Date(dataCheckIn)) / (1000 * 60 * 60 * 24)
      ));

      // Total dos quartos
      const totalQuartos = quartosResult.rows.reduce(
        (soma, q) => soma + parseFloat(q.price_per_night), 0
      ) * noites;

      // Total dos serviços
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

      const basePrice  = parseFloat((totalQuartos + totalServicos).toFixed(2));
      const taxAmount  = parseFloat((basePrice * 0.05).toFixed(2));
      const totalPrice = parseFloat((basePrice + taxAmount).toFixed(2));

      console.log(`💰 Quartos: ${totalQuartos} | Serviços: ${totalServicos} | Base: ${basePrice} | Taxa: ${taxAmount} | TOTAL: ${totalPrice}`);

      // ── Inserir reserva ──────────────────────────────────────────────────
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

      // ── Guardar quartos ──────────────────────────────────────────────────
      for (const rId of roomIds) {
        await client.query(
          `INSERT INTO reservation_rooms (reservation_id, room_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [reserva.id, rId]
        );
      }

      // ── Guardar serviços ─────────────────────────────────────────────────
      for (const s of servicosParaGuardar) {
        await client.query(`
          INSERT INTO reservation_services
            (reservation_id, service_name, service_type, price_per_unit, nights, total_price)
          VALUES ($1,$2,$3,$4,$5,$6)
        `, [reserva.id, s.nome, s.tipo, s.preco, noites, s.precoTotal]);
      }

      // ── Marcar quartos como ocupados ──────────────────────────────────────
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

      // Buscar serviços guardados no banco
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
      res.status(500).json({ error: true, message: 'Erro ao buscar quartos disponíveis' });
    }
  }

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
      return res.status(500).json({ error: true, message: 'Erro ao confirmar pagamento' });
    }
  }
}

module.exports = new ReservaController();