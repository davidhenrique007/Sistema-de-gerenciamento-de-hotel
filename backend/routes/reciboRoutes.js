// backend/routes/reciboRoutes.js
const express = require('express');
const router = express.Router();
const reciboController = require('../controllers/reciboController');
const authMiddleware = require('../middlewares/auth');

// Rotas públicas (com token de acesso)
router.get('/:id/pdf', reciboController.downloadPDF);
router.post('/:id/enviar-email', reciboController.enviarPorEmail);

module.exports = router;
