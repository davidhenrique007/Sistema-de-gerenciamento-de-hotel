// =====================================================
// HOTEL PARADISE - ROOMS ROUTES
// Versão: 1.0.0 (Temporário)
// =====================================================

const express = require('express');
const router = express.Router();

// Rota temporária para testes
router.get('/', (req, res) => {
  res.json({ message: 'Rooms routes working!' });
});

module.exports = router;