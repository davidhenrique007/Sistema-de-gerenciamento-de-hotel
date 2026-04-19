// backend/routes/admin/reconciliacaoRoutes.js
const express = require('express');
const reconciliacaoController = require('../../controllers/admin/reconciliacaoController');
const { verificarToken } = require('../../middlewares/auth');
const { verificarPermissao } = require('../../middlewares/permissaoMiddleware');

const router = express.Router();

router.use(verificarToken);
router.use(verificarPermissao('financeiro', 'visualizar'));

router.get('/reconciliacao', reconciliacaoController.reconciliar);
router.get('/reconciliacao/todos', reconciliacaoController.reconciliarTodos);
router.get('/reconciliacao/divergencias', reconciliacaoController.verificarDivergencias);
router.post('/reconciliacao/sincronizar', reconciliacaoController.sincronizarStatus);
router.post('/reconciliacao/simular', reconciliacaoController.simularPagamento);
router.get('/reconciliacao/relatorio-contabil', reconciliacaoController.gerarRelatorioContabil);

module.exports = router;