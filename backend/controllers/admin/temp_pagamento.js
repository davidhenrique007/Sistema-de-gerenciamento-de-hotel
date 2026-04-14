  async confirmarPagamento(req, res) {
    const client = await db.pool.connect();
    
    try {
      const { id } = req.params;
      const { valor_pago } = req.body;
      const usuario = req.user;

      await client.query('BEGIN');

      const reservaAtual = await client.query('SELECT * FROM reservations WHERE id::text = $1 FOR UPDATE', [String(id)]);
      if (reservaAtual.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Reserva não encontrada' });
      }

      const reserva = reservaAtual.rows[0];

      if (reserva.payment_status === 'paid') {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Pagamento já foi confirmado anteriormente' });
      }

      await client.query(`UPDATE reservations SET payment_status = 'paid', updated_at = NOW() WHERE id::text = $1`, [String(id)]);

      // Registrar log
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

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao confirmar pagamento:', error);
      return res.status(500).json({ success: false, message: 'Erro interno ao confirmar pagamento' });
    } finally { client.release(); }
  }
