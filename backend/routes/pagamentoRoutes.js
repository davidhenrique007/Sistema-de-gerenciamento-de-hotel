// backend/routes/pagamentoRoutes.js
const express = require('express');
const router = express.Router();
const pagamentoController = require('../controllers/pagamentoController');
const authMiddleware = require('../middlewares/auth');

// Rotas protegidas
router.post(
    '/mpesa/iniciar',
    authMiddleware,
    pagamentoController.iniciarPagamentoMpesa
);

router.get(
    '/:reservaId/status',
    authMiddleware,
    pagamentoController.consultarPagamento
);

module.exports = router;