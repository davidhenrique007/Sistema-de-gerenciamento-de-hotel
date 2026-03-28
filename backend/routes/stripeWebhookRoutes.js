// backend/routes/stripeWebhookRoutes.js
const express = require('express');
const router = express.Router();
const stripeWebhookController = require('../controllers/stripeWebhookController');

// Rota pública para webhook Stripe (requer raw body)
router.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhookController.handleWebhook);

module.exports = router;