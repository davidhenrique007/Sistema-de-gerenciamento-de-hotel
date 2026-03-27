// backend/routes/webhookRoutes.js
const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Rota pública para webhook M-Pesa
router.post('/mpesa/confirmar', webhookController.confirmarPagamento);

// Rota para simulação (apenas desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
    router.post('/simular', webhookController.simularWebhook);
}

module.exports = router;
