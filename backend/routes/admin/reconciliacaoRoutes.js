const express = require('express');
const reconciliacaoController = require('../../controllers/admin/reconciliacaoController');
const { verificarToken } = require('../../middlewares/auth');
const { verificarPermissao } = require('../../middlewares/permissaoMiddleware');

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(verificarToken);
router.use(verificarPermissao('financeiro', 'visualizar'));

// Rotas de reconciliação
router.get('/reconciliacao', reconciliacaoController.reconciliar);
router.get('/reconciliacao/todos', reconciliacaoController.reconciliarTodos);
router.get('/reconciliacao/divergencias', reconciliacaoController.verificarDivergencias);
router.post('/reconciliacao/sincronizar', reconciliacaoController.sincronizarStatus);
router.post('/reconciliacao/liberar-reservas', reconciliacaoController.liberarReservasPendentes);
router.get('/reconciliacao/verificar-reservas', reconciliacaoController.verificarReservasPendentes);
router.post('/reconciliacao/simular-mpesa', reconciliacaoController.simularPagamentoMpesa);
router.post('/reconciliacao/simular-stripe', reconciliacaoController.simularPagamentoStripe);

module.exports = router;
