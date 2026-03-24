// =====================================================
// ROTAS DE RESERVAS
// =====================================================

const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');

// Rotas públicas
router.get('/quartos/disponiveis', reservaController.buscarQuartosDisponiveis);
router.get('/quartos/:id/disponibilidade', reservaController.verificarDisponibilidadeQuarto);

// Rotas protegidas (adicionar middleware de autenticação depois)
router.post('/reservas', reservaController.criarReserva);
router.get('/reservas/status/:jobId', reservaController.verificarStatusReserva);

module.exports = router;
