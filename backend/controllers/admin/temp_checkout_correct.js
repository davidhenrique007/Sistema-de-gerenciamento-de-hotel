  async realizarCheckout(req, res) {
    const client = await db.pool.connect();
    
    try {
      const { id } = req.params;
      const usuario = req.user;

      console.log('📝 Realizando check-out da reserva:', id);

      await client.query('BEGIN');

      const reservaAtual = await client.query('SELECT * FROM reservations WHERE id::text = $1 FOR UPDATE', [String(id)]);
      if (reservaAtual.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Reserva não encontrada' });
      }

      const reserva = reservaAtual.rows[0];

      // Verificar se já tem check-out
      if (reserva.check_out_real) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Check-out já foi realizado' });
      }

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
      if (reserva.room_id) {
        await client.query(
          'UPDATE rooms SET status = $1 WHERE id::text = $2',
          ['available', String(reserva.room_id)]
        );
        console.log(`✅ Quarto ${reserva.room_id} liberado para DISPONIVEL`);
      }

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
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Erro ao realizar check-out:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao realizar check-out: ' + error.message
      });
    } finally {
      client.release();
    }
  }
