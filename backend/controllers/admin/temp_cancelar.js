  async cancelarReserva(req, res) {
    const client = await db.pool.connect();
    
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const usuario = req.user;

      if (!motivo || motivo.length < 10) {
        return res.status(400).json({ success: false, message: 'Motivo do cancelamento é obrigatório (mínimo 10 caracteres)' });
      }

      await client.query('BEGIN');

      const reservaAtual = await client.query('SELECT * FROM reservations WHERE id::text = $1 FOR UPDATE', [String(id)]);
      if (reservaAtual.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Reserva não encontrada' });
      }

      const reserva = reservaAtual.rows[0];
      const statusPermitidos = ['pending', 'confirmed'];
      
      if (!statusPermitidos.includes(reserva.status)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: `Não é possível cancelar reserva com status ${reserva.status}` });
      }

      await client.query(`UPDATE reservations SET status = 'cancelled', cancellation_reason = $1, updated_at = NOW() WHERE id::text = $2`, [motivo, String(id)]);

      if (reserva.room_id) {
        await client.query('UPDATE rooms SET status = $1 WHERE id::text = $2', ['available', String(reserva.room_id)]);
      }

      // Registrar log
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

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao cancelar reserva:', error);
      return res.status(500).json({ success: false, message: 'Erro interno ao cancelar reserva' });
    } finally { client.release(); }
  }
