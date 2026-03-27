// backend/routes/clienteRoutes.js
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const authMiddleware = require('../middlewares/auth');

// Rotas públicas
router.post('/identificar', clienteController.identificarCliente);
router.get('/buscar/:telefone', clienteController.buscarPorTelefone);

// Rotas protegidas (opcional)
router.get('/:id', authMiddleware, clienteController.buscarPorId);
router.put('/:id', authMiddleware, clienteController.atualizarCliente);
router.get('/', authMiddleware, clienteController.listarClientes);

module.exports = router;