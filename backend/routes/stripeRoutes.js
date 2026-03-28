// backend/routes/stripeRoutes.js
const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');

// Rotas (sem autenticação para teste)
router.post('/create-intent', stripeController.createPaymentIntent);
router.post('/confirm', stripeController.confirmPayment);
router.get('/status/:reservaId', stripeController.getPaymentStatus);

module.exports = router;
