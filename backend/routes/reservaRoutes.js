// backend/routes/reservaRoutes.js
const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');

router.get('/quartos/disponiveis', reservaController.buscarQuartosDisponiveis);
router.get('/:id', reservaController.buscarReserva);
router.post('/', reservaController.criarReserva);
router.put('/:id/confirmar-pagamento', reservaController.confirmarPagamento);

module.exports = router;
