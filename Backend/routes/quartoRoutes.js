// =====================================================
// HOTEL PARADISE - ROTAS DE QUARTO
// =====================================================

const express = require('express');
const router = express.Router();
const quartoController = require('../controllers/quartoController');

// Rotas públicas (sem autenticação)
router.get('/', quartoController.listarTodos);
router.get('/disponiveis', quartoController.listarDisponiveis);

module.exports = router;
