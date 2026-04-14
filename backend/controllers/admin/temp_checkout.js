  async realizarCheckout(req, res) {
    const client = await db.pool.connect();
    
    try {
      const { id } = req.params;
      const usuario = req.user;

      console.log('📝 Realizando check-out da reserva:', id);

      await client.query('BEGIN');

      const reservaAtual = await client.query(
        'SELECT * FROM reservations WHERE id::text = $1 FOR UPDATE',
        [String(id)]
      );

      if (reservaAtual.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Reserva não encontrada' });
      }

      const reserva = reservaAtual.rows[0];

      if (reserva.status === 'finished') {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Check-out já foi realizado' });
      }

      if (reserva.status !== 'occupied') {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Reserva precisa estar com status HOSPEDADO para fazer check-out'
        });
      }

      // Atualizar status da reserva para 'finished' (finalizada)
      await client.query(
        `UPDATE reservations 
         SET status = 'finished',
             updated_at = NOW()
         WHERE id::text = $1`,
        [String(id)]
      );

      // Liberar o quarto (voltar para disponível)
      if (reserva.room_id) {
        await client.query(
          'UPDATE rooms SET status = $1 WHERE id::text = $2',
          ['available', String(reserva.room_id)]
        );
        console.log(`✅ Quarto ${reserva.room_id} liberado para DISPONIVEL`);
      }

      // Registrar log de auditoria
      await Log.registrar({
        usuarioId: usuario.id,
        usuarioNome: usuario.name || usuario.email,
        usuarioRole: usuario.role,
        acao: 'CHECKOUT',
        recurso: 'reservation',
        recursoId: id,
        dadosAntigos: { status: reserva.status, room_status: 'occupied' },
        dadosNovos: { status: 'finished', room_status: 'available' },
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      await client.query('COMMIT');

      console.log(`✅ Check-out da reserva ${id} realizado com sucesso`);

      return res.status(200).json({
        success: true,
        message: 'Check-out realizado com sucesso'
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
