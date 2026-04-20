const express = require('express');
const router = express.Router();

// Middleware de autenticação (será adicionado depois)
const { verificarToken } = require('../../middlewares/auth');

router.use(verificarToken);

// GET - Métricas de performance
router.get('/performance/metrics', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Performance metrics endpoint',
      timestamp: new Date().toISOString()
    }
  });
});

// GET - Logs de performance
router.get('/performance/logs', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Logs de performance'
  });
});

module.exports = router;
