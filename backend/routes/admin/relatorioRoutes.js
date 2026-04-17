// backend/routes/admin/relatorioRoutes.js
const express = require('express');
const relatorioController = require('../../controllers/admin/relatorioController');
const { verificarToken } = require('../../middlewares/auth');
const { verificarPermissao } = require('../../middlewares/permissaoMiddleware');

const router = express.Router();

router.use(verificarToken);

router.get('/relatorios/receita', verificarPermissao('relatorios', 'visualizar'), relatorioController.getReceitaPeriodo);
router.get('/relatorios/comparativo', verificarPermissao('relatorios', 'visualizar'), relatorioController.getComparativo);
router.get('/relatorios/tendencia', verificarPermissao('relatorios', 'visualizar'), relatorioController.getTendenciaProjecao);
router.get('/relatorios/metricas', verificarPermissao('relatorios', 'visualizar'), relatorioController.getMetricasDashboard);

module.exports = router;