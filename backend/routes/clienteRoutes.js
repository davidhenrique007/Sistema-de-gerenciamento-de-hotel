const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { verificarToken } = require('../middlewares/auth');

// Rotas públicas
router.post('/identificar', clienteController.identificarCliente);
router.get('/buscar/:telefone', clienteController.buscarPorTelefone);

// Rotas protegidas (opcional)
router.get('/:id', verificarToken, clienteController.buscarPorId);
router.put('/:id', verificarToken, clienteController.atualizarCliente);
router.get('/', verificarToken, clienteController.listarClientes);

module.exports = router;
