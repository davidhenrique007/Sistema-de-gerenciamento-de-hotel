const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');

router.get('/quartos/disponiveis', reservaController.buscarQuartosDisponiveis);
router.get('/cliente/:clienteId', reservaController.listarReservasCliente);
router.get('/:id', reservaController.buscarReserva);
router.post('/', reservaController.criarReserva);
router.put('/:id/confirmar-pagamento', reservaController.confirmarPagamento);
router.put('/:id/cancelar', reservaController.cancelarReserva);
router.put('/:id/alterar', reservaController.alterarReserva);

module.exports = router;
