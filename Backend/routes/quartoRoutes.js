// =====================================================
// HOTEL PARADISE - ROTAS DE QUARTO
// =====================================================

const express = require('express');
const router = express.Router();
const quartoController = require('../controllers/quartoController');
const { authenticate } = require('../middlewares/auth');

// Rotas públicas
router.get('/disponiveis', quartoController.listarDisponiveis);

// Rotas protegidas (admin)
router.get('/', authenticate, quartoController.listarTodos);
router.get('/:id', authenticate, quartoController.buscarPorId);

module.exports = router;
