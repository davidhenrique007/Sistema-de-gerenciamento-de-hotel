const express = require('express');
const router = express.Router();

// Rota simples para dashboard admin
router.get('/dashboard', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Admin dashboard - API funcionando',
    timestamp: new Date().toISOString()
  });
});

// Rota de health check para admin
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
