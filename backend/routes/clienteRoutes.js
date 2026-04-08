const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Rota simples para identificar cliente
router.post('/identificar', async (req, res) => {
  try {
    const { name, phone, email, document } = req.body;
    
    let cliente = await pool.query('SELECT * FROM guests WHERE phone = $1', [phone]);
    
    if (cliente.rows.length === 0) {
      const result = await pool.query(
        'INSERT INTO guests (name, phone, email, document) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, phone, email, document]
      );
      cliente = result.rows[0];
    } else {
      cliente = cliente.rows[0];
    }
    
    res.json({ success: true, data: cliente });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Rota para buscar por telefone
router.get('/buscar/:telefone', async (req, res) => {
  try {
    const { telefone } = req.params;
    const result = await pool.query('SELECT * FROM guests WHERE phone = $1', [telefone]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cliente não encontrado' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
