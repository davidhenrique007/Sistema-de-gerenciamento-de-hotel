const express = require('express');
const router = express.Router();
const pool = require('../../config/database');

// Métricas - versão simples sem autenticação
router.get('/metrics', async (req, res) => {
  try {
    const hoje = new Date().toISOString().split('T')[0];
    
    const reservasHoje = await pool.query(
      'SELECT COUNT(*) as total FROM reservations WHERE DATE(created_at) = $1 AND status = $2',
      [hoje, 'confirmed']
    );
    
    const quartosOcupados = await pool.query(
      "SELECT COUNT(*) as total FROM rooms WHERE status = 'occupied'"
    );
    
    const quartosDisponiveis = await pool.query(
      "SELECT COUNT(*) as total FROM rooms WHERE status = 'available'"
    );
    
    res.json({
      success: true,
      data: {
        reservasHoje: parseInt(reservasHoje.rows[0].total),
        quartosOcupados: parseInt(quartosOcupados.rows[0].total),
        quartosDisponiveis: parseInt(quartosDisponiveis.rows[0].total),
        ultimaAtualizacao: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
