const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Rota SIMPLES para quartos disponíveis
router.get('/disponiveis', async (req, res) => {
  try {
    const { tipo } = req.query;
    
    let query = "SELECT id, room_number, type, price_per_night, status FROM rooms WHERE status = 'available'";
    const params = [];
    
    if (tipo && tipo !== 'undefined') {
      query += " AND type = $1";
      params.push(tipo);
    }
    
    query += " ORDER BY room_number";
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar quartos',
      error: error.message 
    });
  }
});

module.exports = router;
