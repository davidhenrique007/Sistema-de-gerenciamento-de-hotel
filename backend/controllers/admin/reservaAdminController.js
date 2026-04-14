<<<<<<< HEAD
﻿const db = require('../../config/database');
const Log = require('../../models/Log');
=======
﻿const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const db = {
  query: (text, params) => pool.query(text, params),
  pool: pool
};
>>>>>>> origin/main

class ReservaAdminController {
  async listarReservas(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        phone,
        checkInFrom,
        checkInTo,
        paymentStatus,
        roomType,
        roomNumber,
        status
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const params = [];
      let paramIndex = 1;
      const conditions = [];

      let queryBase = `
        SELECT 
          r.id,
          r.reservation_code as codigo_reserva,
          r.check_in as data_checkin,
          r.check_out as data_checkout,
          r.total_price as valor_total,
          r.payment_status as status_pagamento,
          r.status as status_reserva,
          r.created_at as data_criacao,
          r.special_requests as observacoes,
          r.payment_method as metodo_pagamento,
          g.id as cliente_id,
          g.name as cliente_nome,
          g.email as cliente_email,
          g.phone as cliente_telefone,
          g.document as cliente_documento,
          r.room_id as quarto_id,
          rm.room_number as quarto_numero,
          rm.type as quarto_tipo,
          rm.floor as quarto_andar
        FROM reservations r
        INNER JOIN guests g ON r.guest_id = g.id
        INNER JOIN rooms rm ON r.room_id = rm.id
      `;

      if (search) {
        conditions.push(`(g.name ILIKE $${paramIndex} OR g.phone ILIKE $${paramIndex} OR r.reservation_code ILIKE $${paramIndex})`);
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (phone) {
        conditions.push(`g.phone ILIKE $${paramIndex}`);
        params.push(`%${phone}%`);
        paramIndex++;
      }

      if (checkInFrom) {
        conditions.push(`r.check_in >= $${paramIndex}`);
        params.push(checkInFrom);
        paramIndex++;
      }

      if (checkInTo) {
        conditions.push(`r.check_in <= $${paramIndex}`);
        params.push(checkInTo);
        paramIndex++;
      }

      if (paymentStatus) {
        conditions.push(`r.payment_status = $${paramIndex}`);
        params.push(paymentStatus);
        paramIndex++;
      }

      if (roomType) {
        conditions.push(`rm.type = $${paramIndex}`);
        params.push(roomType);
        paramIndex++;
      }

      if (roomNumber) {
        conditions.push(`rm.room_number = $${paramIndex}`);
        params.push(roomNumber);
        paramIndex++;
      }

      if (status) {
        conditions.push(`r.status = $${paramIndex}`);
        params.push(status);
        paramIndex++;
      }

      if (conditions.length > 0) {
        queryBase += ' WHERE ' + conditions.join(' AND ');
      }

      queryBase += ` ORDER BY r.check_in DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit), offset);

      const reservasResult = await db.query(queryBase, params);
      const reservas = reservasResult.rows;

      let countQuery = `
        SELECT COUNT(DISTINCT r.id) as total
        FROM reservations r
        INNER JOIN guests g ON r.guest_id = g.id
        INNER JOIN rooms rm ON r.room_id = rm.id
      `;
      
      if (conditions.length > 0) {
        countQuery += ' WHERE ' + conditions.join(' AND ');
      }
      
      const countParams = params.slice(0, -2);
      const totalResult = await db.query(countQuery, countParams);
      const total = parseInt(totalResult.rows[0]?.total || 0);

      const hoje = new Date().toISOString().split('T')[0];
      
      const reservasHojeResult = await db.query(`
        SELECT COUNT(*) as total FROM reservations 
        WHERE check_in::date = $1 AND status IN ('confirmed', 'pending')
      `, [hoje]);
      const reservasHoje = parseInt(reservasHojeResult.rows[0]?.total || 0);

      const checkinsPendentesResult = await db.query(`
        SELECT COUNT(*) as total FROM reservations 
        WHERE check_in::date = $1 AND status = 'confirmed' AND check_in_real IS NULL
      `, [hoje]);
      const checkinsPendentes = parseInt(checkinsPendentesResult.rows[0]?.total || 0);

      const pagamentosAtrasadosResult = await db.query(`
        SELECT COUNT(*) as total FROM reservations 
        WHERE payment_status IN ('pending', 'partial') 
        AND check_in::date < $1 AND status = 'confirmed'
      `, [hoje]);
      const pagamentosAtrasados = parseInt(pagamentosAtrasadosResult.rows[0]?.total || 0);

      return res.status(200).json({
        success: true,
        data: reservas,
        summary: {
          todayReservations: reservasHoje,
          pendingCheckins: checkinsPendentes,
          latePayments: pagamentosAtrasados
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });

    } catch (error) {
      console.error('Erro ao listar reservas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao carregar reservas'
      });
    }
  }

  async obterDetalhesReserva(req, res) {
    try {
      const { id } = req.params;

      const reservaResult = await db.query(`
        SELECT 
          r.*,
          r.reservation_code as codigo_reserva,
          r.check_in as data_checkin,
          r.check_out as data_checkout,
          r.total_price as valor_total,
          r.payment_status as status_pagamento,
          r.status as status_reserva,
          r.created_at as data_criacao,
          r.special_requests as observacoes,
          r.payment_method as metodo_pagamento,
          g.id as cliente_id,
          g.name as cliente_nome,
          g.email as cliente_email,
          g.phone as cliente_telefone,
          g.document as cliente_documento,
          rm.room_number as quarto_numero,
          rm.type as quarto_tipo,
          rm.floor as quarto_andar
        FROM reservations r
        INNER JOIN guests g ON r.guest_id = g.id
        INNER JOIN rooms rm ON r.room_id = rm.id
        WHERE r.id::text = $1
      `, [id]);

      if (!reservaResult.rows || reservaResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Reserva não encontrada'
        });
      }

      return res.status(200).json({
        success: true,
        data: reservaResult.rows[0]
      });

    } catch (error) {
      console.error('Erro ao obter detalhes:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao carregar detalhes'
      });
    }
  }

<<<<<<< HEAD
  // ==================== LOGS DE RESERVAS ====================

=======
>>>>>>> origin/main
  async editarReserva(req, res) {
    const client = await db.pool.connect();
    
    try {
      const { id } = req.params;
<<<<<<< HEAD
      const { quarto_id, data_checkin, data_checkout, metodo_pagamento, observacoes } = req.body;
      const usuario = req.user;
      const TAXA_IMPOSTO = 0.05;

      await client.query('BEGIN');

      const reservaAtual = await client.query('SELECT * FROM reservations WHERE id::text = $1 FOR UPDATE', [String(id)]);
=======
      const {
        quarto_id,
        data_checkin,
        data_checkout,
        metodo_pagamento,
        observacoes
      } = req.body;
      const TAXA_IMPOSTO = 0.05;

      console.log('📝 Editando reserva ID:', id);
      console.log('📦 Dados recebidos:', req.body);

      await client.query('BEGIN');

      // Buscar reserva atual - usando CAST para UUID
      const reservaAtual = await client.query(
        'SELECT * FROM reservations WHERE id::text = $1 FOR UPDATE',
        [String(id)]
      );

>>>>>>> origin/main
      if (reservaAtual.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Reserva não encontrada' });
      }

      const reserva = reservaAtual.rows[0];
      const quartoIdFinal = quarto_id || reserva.room_id;

<<<<<<< HEAD
      const quartoInfo = await client.query('SELECT price_per_night, room_number, type FROM rooms WHERE id::text = $1', [String(quartoIdFinal)]);
=======
      // Buscar preço do quarto
      const quartoInfo = await client.query(
        'SELECT price_per_night, room_number, type FROM rooms WHERE id::text = $1',
        [String(quartoIdFinal)]
      );
      
>>>>>>> origin/main
      if (quartoInfo.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Quarto não encontrado' });
      }
<<<<<<< HEAD

      const precoPorNoite = parseFloat(quartoInfo.rows[0].price_per_night);
=======
      
      const precoPorNoite = parseFloat(quartoInfo.rows[0].price_per_night);
      
      // Calcular número de noites
>>>>>>> origin/main
      const checkinDate = new Date(data_checkin || reserva.check_in);
      const checkoutDate = new Date(data_checkout || reserva.check_out);
      const diffTime = Math.abs(checkoutDate - checkinDate);
      const noites = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
<<<<<<< HEAD

=======
      
      // Calcular valores com taxa
>>>>>>> origin/main
      const valorBase = precoPorNoite * noites;
      const valorTaxa = valorBase * TAXA_IMPOSTO;
      const novoValorTotal = valorBase + valorTaxa;

<<<<<<< HEAD
=======
      console.log(`📊 Quarto: ${quartoInfo.rows[0].room_number} - ${quartoInfo.rows[0].type}`);
      console.log(`📊 Preço/noite: ${precoPorNoite} MTn`);
      console.log(`📊 Noites: ${noites}`);
      console.log(`📊 Base: ${valorBase} MTn`);
      console.log(`📊 Taxa (5%): ${valorTaxa} MTn`);
      console.log(`📊 Total: ${novoValorTotal} MTn`);

      // Atualizar campos
>>>>>>> origin/main
      const updates = [];
      const params = [];
      let paramIndex = 1;

<<<<<<< HEAD
      if (quarto_id) { updates.push(`room_id = $${paramIndex++}::uuid`); params.push(quarto_id); }
      if (data_checkin) { updates.push(`check_in = $${paramIndex++}`); params.push(data_checkin); }
      if (data_checkout) { updates.push(`check_out = $${paramIndex++}`); params.push(data_checkout); }
      if (metodo_pagamento) { updates.push(`payment_method = $${paramIndex++}`); params.push(metodo_pagamento); }
      if (observacoes !== undefined) { updates.push(`special_requests = $${paramIndex++}`); params.push(observacoes); }

=======
      if (quarto_id) {
        updates.push(`room_id = $${paramIndex++}::uuid`);
        params.push(quarto_id);
      }
      if (data_checkin) {
        updates.push(`check_in = $${paramIndex++}`);
        params.push(data_checkin);
      }
      if (data_checkout) {
        updates.push(`check_out = $${paramIndex++}`);
        params.push(data_checkout);
      }
      if (metodo_pagamento) {
        updates.push(`payment_method = $${paramIndex++}`);
        params.push(metodo_pagamento);
      }
      if (observacoes !== undefined) {
        updates.push(`special_requests = $${paramIndex++}`);
        params.push(observacoes);
      }
      
>>>>>>> origin/main
      updates.push(`total_price = $${paramIndex++}`);
      params.push(novoValorTotal);
      updates.push(`updated_at = NOW()`);
      params.push(id);

<<<<<<< HEAD
      await client.query(`UPDATE reservations SET ${updates.join(', ')} WHERE id::text = $${paramIndex}`, params);

      // Registrar log EDIT_RESERVATION
      await Log.registrar({
        usuarioId: usuario.id,
        usuarioNome: usuario.name || usuario.email,
        usuarioRole: usuario.role,
        acao: 'EDIT_RESERVATION',
        recurso: 'reservation',
        recursoId: id,
        dadosAntigos: { room_id: reserva.room_id, check_in: reserva.check_in, check_out: reserva.check_out, total_price: reserva.total_price },
        dadosNovos: { room_id: quartoIdFinal, check_in: data_checkin || reserva.check_in, check_out: data_checkout || reserva.check_out, total_price: novoValorTotal },
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      await client.query('COMMIT');
      console.log(`✅ Log EDIT_RESERVATION registrado para reserva ${id}`);

      return res.status(200).json({ success: true, message: 'Reserva atualizada com sucesso' });
=======
      const updateQuery = `UPDATE reservations SET ${updates.join(', ')} WHERE id::text = $${paramIndex}`;
      console.log('📝 Executando update:', updateQuery);
      
      await client.query(updateQuery, params);
      
      await client.query('COMMIT');

      return res.status(200).json({
        success: true,
        message: 'Reserva atualizada com sucesso',
        data: {
          valor_base: valorBase,
          valor_taxa: valorTaxa,
          novo_valor: novoValorTotal,
          noites: noites,
          preco_por_noite: precoPorNoite,
          taxa_percentual: 5
        }
      });
>>>>>>> origin/main

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao editar reserva:', error);
<<<<<<< HEAD
      return res.status(500).json({ success: false, message: 'Erro interno ao editar reserva' });
    } finally { client.release(); }
  }

  async cancelarReserva(req, res) {
=======
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao editar reserva: ' + error.message
      });
    } finally {
      client.release();
    }
  }

    async cancelarReserva(req, res) {
>>>>>>> origin/main
    const client = await db.pool.connect();
    
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const usuario = req.user;

<<<<<<< HEAD
      if (!motivo || motivo.length < 10) {
        return res.status(400).json({ success: false, message: 'Motivo do cancelamento é obrigatório (mínimo 10 caracteres)' });
=======
      console.log('📝 Cancelando reserva ID:', id);
      console.log('📦 Motivo:', motivo);

      if (!motivo || motivo.length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Motivo do cancelamento é obrigatório (mínimo 10 caracteres)'
        });
>>>>>>> origin/main
      }

      await client.query('BEGIN');

<<<<<<< HEAD
      const reservaAtual = await client.query('SELECT * FROM reservations WHERE id::text = $1 FOR UPDATE', [String(id)]);
=======
      // Buscar reserva atual
      const reservaAtual = await client.query(
        'SELECT * FROM reservations WHERE id::text = $1 FOR UPDATE',
        [String(id)]
      );

>>>>>>> origin/main
      if (reservaAtual.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Reserva não encontrada' });
      }

      const reserva = reservaAtual.rows[0];
      const statusPermitidos = ['pending', 'confirmed'];
      
      if (!statusPermitidos.includes(reserva.status)) {
        await client.query('ROLLBACK');
<<<<<<< HEAD
        return res.status(400).json({ success: false, message: `Não é possível cancelar reserva com status ${reserva.status}` });
      }

      await client.query(`UPDATE reservations SET status = 'cancelled', cancellation_reason = $1, updated_at = NOW() WHERE id::text = $2`, [motivo, String(id)]);

      if (reserva.room_id) {
        await client.query('UPDATE rooms SET status = $1 WHERE id::text = $2', ['available', String(reserva.room_id)]);
      }

      // Registrar log CANCEL_RESERVATION
      await Log.registrar({
        usuarioId: usuario.id,
        usuarioNome: usuario.name || usuario.email,
        usuarioRole: usuario.role,
        acao: 'CANCEL_RESERVATION',
        recurso: 'reservation',
        recursoId: id,
        dadosAntigos: { status: reserva.status },
        dadosNovos: { status: 'cancelled', motivo: motivo },
        motivo: motivo,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      await client.query('COMMIT');
      console.log(`✅ Log CANCEL_RESERVATION registrado para reserva ${id}`);

      return res.status(200).json({ success: true, message: 'Reserva cancelada com sucesso' });
=======
        return res.status(400).json({
          success: false,
          message: `Não é possível cancelar reserva com status ${reserva.status}`
        });
      }

      // Atualizar status da reserva para cancelled
      await client.query(
        `UPDATE reservations 
         SET status = 'cancelled',
             cancellation_reason = $1,
             updated_at = NOW()
         WHERE id::text = $2`,
        [motivo, String(id)]
      );

      // Liberar o quarto se estava ocupado/reservado
      if (reserva.room_id) {
        await client.query(
          'UPDATE rooms SET status = $1 WHERE id::text = $2',
          ['available', String(reserva.room_id)]
        );
        console.log(`✅ Quarto ${reserva.room_id} liberado`);
      }

      await client.query('COMMIT');

      console.log(`✅ Reserva ${id} cancelada com sucesso`);

      return res.status(200).json({
        success: true,
        message: 'Reserva cancelada com sucesso'
      });
>>>>>>> origin/main

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao cancelar reserva:', error);
<<<<<<< HEAD
      return res.status(500).json({ success: false, message: 'Erro interno ao cancelar reserva' });
    } finally { client.release(); }
  }

  async confirmarPagamento(req, res) {
=======
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao cancelar reserva: ' + error.message
      });
    } finally {
      client.release();
    }
  }

    async confirmarPagamento(req, res) {
>>>>>>> origin/main
    const client = await db.pool.connect();
    
    try {
      const { id } = req.params;
      const { valor_pago } = req.body;
      const usuario = req.user;

<<<<<<< HEAD
      await client.query('BEGIN');

      const reservaAtual = await client.query('SELECT * FROM reservations WHERE id::text = $1 FOR UPDATE', [String(id)]);
=======
      console.log('📝 Confirmando pagamento reserva ID:', id);

      await client.query('BEGIN');

      const reservaAtual = await client.query(
        'SELECT * FROM reservations WHERE id::text = $1 FOR UPDATE',
        [String(id)]
      );

>>>>>>> origin/main
      if (reservaAtual.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Reserva não encontrada' });
      }

      const reserva = reservaAtual.rows[0];

      if (reserva.payment_status === 'paid') {
        await client.query('ROLLBACK');
<<<<<<< HEAD
        return res.status(400).json({ success: false, message: 'Pagamento já foi confirmado anteriormente' });
      }

      await client.query(`UPDATE reservations SET payment_status = 'paid', updated_at = NOW() WHERE id::text = $1`, [String(id)]);

      // Registrar log CONFIRM_PAYMENT
      await Log.registrar({
        usuarioId: usuario.id,
        usuarioNome: usuario.name || usuario.email,
        usuarioRole: usuario.role,
        acao: 'CONFIRM_PAYMENT',
        recurso: 'reservation',
        recursoId: id,
        dadosAntigos: { payment_status: reserva.payment_status },
        dadosNovos: { payment_status: 'paid', valor_pago: valor_pago || reserva.total_price },
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      await client.query('COMMIT');
      console.log(`✅ Log CONFIRM_PAYMENT registrado para reserva ${id}`);

      return res.status(200).json({ success: true, message: 'Pagamento confirmado com sucesso' });
=======
        return res.status(400).json({
          success: false,
          message: 'Pagamento já foi confirmado anteriormente'
        });
      }

      if (reserva.status !== 'confirmed') {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Reserva precisa estar confirmada para registrar pagamento'
        });
      }

      await client.query(
        `UPDATE reservations 
         SET payment_status = 'paid',
             updated_at = NOW()
         WHERE id::text = $2`,
        [String(id)]
      );

      await client.query('COMMIT');

      console.log(`✅ Pagamento da reserva ${id} confirmado`);

      return res.status(200).json({
        success: true,
        message: 'Pagamento confirmado com sucesso'
      });
>>>>>>> origin/main

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao confirmar pagamento:', error);
<<<<<<< HEAD
      return res.status(500).json({ success: false, message: 'Erro interno ao confirmar pagamento' });
    } finally { client.release(); }
  }

      async realizarCheckin(req, res) {
=======
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao confirmar pagamento'
      });
    } finally {
      client.release();
    }
  }

    async realizarCheckin(req, res) {
>>>>>>> origin/main
    const client = await db.pool.connect();
    
    try {
      const { id } = req.params;
      const usuario = req.user;

<<<<<<< HEAD
      console.log('📝 Realizando check-in da reserva:', id);

      await client.query('BEGIN');

      const reservaAtual = await client.query('SELECT * FROM reservations WHERE id::text = $1 FOR UPDATE', [String(id)]);
=======
      console.log('📝 Realizando check-in reserva ID:', id);

      await client.query('BEGIN');

      const reservaAtual = await client.query(
        'SELECT * FROM reservations WHERE id::text = $1 FOR UPDATE',
        [String(id)]
      );

>>>>>>> origin/main
      if (reservaAtual.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Reserva não encontrada' });
      }

      const reserva = reservaAtual.rows[0];

<<<<<<< HEAD
      // Verificar se já está finalizado
      if (reserva.status === 'finished') {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Reserva já finalizada' });
      }

      // Verificar se pode fazer check-in (apenas confirmed)
=======
      if (reserva.status === 'occupied') {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Check-in já foi realizado' });
      }

>>>>>>> origin/main
      if (reserva.status !== 'confirmed') {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
<<<<<<< HEAD
          message: `Não é possível fazer check-in de reserva com status ${reserva.status}. Status deve ser 'confirmed'.`
        });
      }

      // Usar status 'occupied' (se existir) ou manter como 'confirmed' mas marcar check_in_real
      // Como 'occupied' pode não existir, vamos apenas marcar a data de check-in real
      await client.query(`
        UPDATE reservations 
        SET check_in_real = NOW(),
            updated_at = NOW()
        WHERE id::text = $1
      `, [String(id)]);

      console.log(`✅ Check-in da reserva ${id} registrado (data: ${new Date().toISOString()})`);

      // Atualizar status do quarto para 'occupied'
=======
          message: `Não é possível fazer check-in de reserva com status ${reserva.status}`
        });
      }

      const hoje = new Date().toISOString().split('T')[0];
      const dataCheckin = new Date(reserva.check_in).toISOString().split('T')[0];

      if (dataCheckin > hoje) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Check-in só pode ser realizado a partir da data de entrada'
        });
      }

      await client.query(
        `UPDATE reservations 
         SET status = 'occupied',
             check_in_real = NOW(),
             updated_at = NOW()
         WHERE id::text = $1`,
        [String(id)]
      );

>>>>>>> origin/main
      if (reserva.room_id) {
        await client.query(
          'UPDATE rooms SET status = $1 WHERE id::text = $2',
          ['occupied', String(reserva.room_id)]
        );
        console.log(`✅ Quarto ${reserva.room_id} marcado como OCUPADO`);
      }

<<<<<<< HEAD
      // Registrar log de auditoria
      await Log.registrar({
        usuarioId: usuario.id,
        usuarioNome: usuario.name || usuario.email,
        usuarioRole: usuario.role,
        acao: 'CHECKIN',
        recurso: 'reservation',
        recursoId: id,
        dadosAntigos: { status: reserva.status, check_in_real: reserva.check_in_real },
        dadosNovos: { check_in_real: new Date().toISOString() },
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      await client.query('COMMIT');

      return res.status(200).json({
        success: true,
        message: 'Check-in realizado com sucesso! Data de entrada registrada.'
=======
      await client.query('COMMIT');

      console.log(`✅ Check-in da reserva ${id} realizado com sucesso`);

      return res.status(200).json({
        success: true,
        message: 'Check-in realizado com sucesso'
>>>>>>> origin/main
      });

    } catch (error) {
      await client.query('ROLLBACK');
<<<<<<< HEAD
      console.error('❌ Erro ao realizar check-in:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao realizar check-in: ' + error.message
=======
      console.error('Erro ao realizar check-in:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao realizar check-in'
>>>>>>> origin/main
      });
    } finally {
      client.release();
    }
  }

<<<<<<< HEAD

      async realizarCheckout(req, res) {
=======
    async realizarCheckout(req, res) {
>>>>>>> origin/main
    const client = await db.pool.connect();
    
    try {
      const { id } = req.params;
      const usuario = req.user;

<<<<<<< HEAD
      console.log('📝 Realizando check-out da reserva:', id);

      await client.query('BEGIN');

      const reservaAtual = await client.query('SELECT * FROM reservations WHERE id::text = $1 FOR UPDATE', [String(id)]);
=======
      console.log('📝 Realizando check-out reserva ID:', id);

      await client.query('BEGIN');

      const reservaAtual = await client.query(
        'SELECT * FROM reservations WHERE id::text = $1 FOR UPDATE',
        [String(id)]
      );

>>>>>>> origin/main
      if (reservaAtual.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Reserva não encontrada' });
      }

      const reserva = reservaAtual.rows[0];

<<<<<<< HEAD
      // Verificar se já tem check-out
      if (reserva.check_out_real) {
=======
      if (reserva.status === 'finished') {
>>>>>>> origin/main
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Check-out já foi realizado' });
      }

<<<<<<< HEAD
      // Verificar se tem check-in
      if (!reserva.check_in_real) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Check-in ainda não foi realizado. Faça check-in primeiro.'
        });
      }

      // Registrar check-out
      await client.query(`
        UPDATE reservations 
        SET check_out_real = NOW(),
            status = 'finished',
            updated_at = NOW()
        WHERE id::text = $1
      `, [String(id)]);

      console.log(`✅ Check-out da reserva ${id} registrado (data: ${new Date().toISOString()})`);

      // Liberar o quarto (voltar para disponível)
=======
      if (reserva.status !== 'occupied') {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Reserva precisa estar com status HOSPEDADO para fazer check-out'
        });
      }

      await client.query(
        `UPDATE reservations 
         SET status = 'finished',
             check_out_real = NOW(),
             updated_at = NOW()
         WHERE id::text = $1`,
        [String(id)]
      );

>>>>>>> origin/main
      if (reserva.room_id) {
        await client.query(
          'UPDATE rooms SET status = $1 WHERE id::text = $2',
          ['available', String(reserva.room_id)]
        );
        console.log(`✅ Quarto ${reserva.room_id} liberado para DISPONIVEL`);
      }

<<<<<<< HEAD
      // Calcular duração da estadia
      const checkinTime = new Date(reserva.check_in_real);
      const checkoutTime = new Date();
      const diffMs = checkoutTime - checkinTime;
      const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      // Registrar log de auditoria
      await Log.registrar({
        usuarioId: usuario.id,
        usuarioNome: usuario.name || usuario.email,
        usuarioRole: usuario.role,
        acao: 'CHECKOUT',
        recurso: 'reservation',
        recursoId: id,
        dadosAntigos: { status: reserva.status, check_out_real: reserva.check_out_real },
        dadosNovos: { status: 'finished', check_out_real: new Date().toISOString(), duracao: `${diffHoras}h ${diffMinutos}m` },
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      await client.query('COMMIT');

      return res.status(200).json({
        success: true,
        message: `Check-out realizado com sucesso! Duração da estadia: ${diffHoras}h ${diffMinutos}m`
=======
      await client.query('COMMIT');

      console.log(`✅ Check-out da reserva ${id} realizado com sucesso`);

      return res.status(200).json({
        success: true,
        message: 'Check-out realizado com sucesso'
>>>>>>> origin/main
      });

    } catch (error) {
      await client.query('ROLLBACK');
<<<<<<< HEAD
      console.error('❌ Erro ao realizar check-out:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao realizar check-out: ' + error.message
=======
      console.error('Erro ao realizar check-out:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao realizar check-out'
>>>>>>> origin/main
      });
    } finally {
      client.release();
    }
  }

<<<<<<< HEAD

=======
>>>>>>> origin/main
  async reenviarRecibo(req, res) {
    return res.status(501).json({ success: false, message: 'Funcionalidade em desenvolvimento' });
  }
}

module.exports = new ReservaAdminController();


<<<<<<< HEAD
=======


>>>>>>> origin/main
