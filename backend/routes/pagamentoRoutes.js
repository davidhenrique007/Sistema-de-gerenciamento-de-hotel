const express = require('express');
const router = express.Router();
const pagamentoController = require('../controllers/pagamentoController');

// Rotas de pagamento
router.post('/mpesa/iniciar', pagamentoController.iniciarPagamentoMpesa);
router.post('/mpesa/confirmar', pagamentoController.confirmarPagamentoMpesa);
router.post('/cartao/criar-intent', pagamentoController.criarIntentCartao);
router.post('/cartao/confirmar', pagamentoController.confirmarPagamentoCartao);

module.exports = router;
