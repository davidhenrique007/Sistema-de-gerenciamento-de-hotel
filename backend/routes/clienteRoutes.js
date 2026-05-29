const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// =====================================================
// POST /api/clientes/identificar
// =====================================================
router.post('/identificar', async (req, res) => {
  try {
    const { name, phone, email, document } = req.body;

    console.log('📝 Identificando cliente:', { name, phone, document, email });

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Nome e telefone são obrigatórios' });
    }

    const telefoneLimpo = String(phone).replace(/\D/g, '');

    // Buscar cliente existente
    let result = await pool.query(
      'SELECT id, name, phone, email, document, created_at FROM guests WHERE phone = $1',
      [telefoneLimpo]
    );

    let cliente;

    if (result.rows.length > 0) {
      cliente = result.rows[0];
      console.log('✅ Cliente encontrado:', cliente.name);

      // Atualizar dados se necessário
      const updates = [];
      const values = [];
      let idx = 1;

      if (name && name !== cliente.name)         { updates.push(`name = $${idx++}`);     values.push(name); }
      if (document && document !== cliente.document) { updates.push(`document = $${idx++}`); values.push(document.replace(/[\s-]/g, '').toUpperCase()); }
      if (email && email !== cliente.email)      { updates.push(`email = $${idx++}`);    values.push(email); }

      if (updates.length > 0) {
        values.push(cliente.id);
        await pool.query(
          `UPDATE guests SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx}::uuid`,
          values
        );
        result = await pool.query(
          'SELECT id, name, phone, email, document, created_at FROM guests WHERE id = $1::uuid',
          [cliente.id]
        );
        cliente = result.rows[0];
      }
    } else {
      // Criar novo cliente
      console.log('🆕 Criando novo cliente:', name);
      const docFormatado = document ? document.replace(/[\s-]/g, '').toUpperCase() : null;
      result = await pool.query(
        `INSERT INTO guests (name, phone, email, document)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, phone, email, document, created_at`,
        [name, telefoneLimpo, email || null, docFormatado]
      );
      cliente = result.rows[0];
    }

    // ✅ Devolve campos em inglês (name, phone, document)
    res.json({
      success: true,
      message: 'Cliente identificado com sucesso',
      data: {
        id:         cliente.id,
        name:       cliente.name,
        phone:      cliente.phone,
        email:      cliente.email,
        document:   cliente.document,
        created_at: cliente.created_at,
      }
    });

  } catch (error) {
    console.error('🔥 Erro ao identificar cliente:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================================
// GET /api/clientes/buscar/:telefone
// =====================================================
router.get('/buscar/:telefone', async (req, res) => {
  try {
    const telefoneLimpo = String(req.params.telefone).replace(/\D/g, '');
    const result = await pool.query(
      'SELECT id, name, phone, email, document, created_at FROM guests WHERE phone = $1',
      [telefoneLimpo]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cliente não encontrado' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;