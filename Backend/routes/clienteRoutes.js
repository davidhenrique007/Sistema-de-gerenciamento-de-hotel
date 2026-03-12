// =====================================================
// HOTEL PARADISE - ROTAS DE CLIENTE
// Versão: 1.0.0
// =====================================================

const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { authenticate } = require('../middlewares/auth');

// =====================================================
// ROTAS PÚBLICAS (para identificação)
// =====================================================

// Identificar cliente (fluxo principal)
router.post('/identificar', clienteController.identificarCliente);

// =====================================================
// ROTAS PROTEGIDAS (apenas admin)
// =====================================================

// Buscar cliente por telefone
router.get('/:telefone', authenticate, clienteController.buscarPorTelefone);

// Criar novo cliente
router.post('/', authenticate, clienteController.criarCliente);

// Atualizar cliente
router.put('/:id', authenticate, clienteController.atualizarCliente);

module.exports = router;