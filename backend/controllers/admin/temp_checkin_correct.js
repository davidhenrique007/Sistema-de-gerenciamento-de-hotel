  async realizarCheckin(req, res) {
    const client = await db.pool.connect();
    
    try {
      const { id } = req.params;
      const usuario = req.user;

      console.log('📝 Realizando check-in da reserva:', id);

      await client.query('BEGIN');

      const reservaAtual = await client.query('SELECT * FROM reservations WHERE id::text = $1 FOR UPDATE', [String(id)]);
      if (reservaAtual.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Reserva não encontrada' });
      }

      const reserva = reservaAtual.rows[0];

      // Verificar se já está finalizado
      if (reserva.status === 'finished') {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Reserva já finalizada' });
      }

      // Verificar se pode fazer check-in (apenas confirmed)
      if (reserva.status !== 'confirmed') {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
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
      if (reserva.room_id) {
        await client.query(
          'UPDATE rooms SET status = $1 WHERE id::text = $2',
          ['occupied', String(reserva.room_id)]
        );
        console.log(`✅ Quarto ${reserva.room_id} marcado como OCUPADO`);
      }

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
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Erro ao realizar check-in:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao realizar check-in: ' + error.message
      });
    } finally {
      client.release();
    }
  }
