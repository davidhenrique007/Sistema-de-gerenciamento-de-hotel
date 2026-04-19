// backend/routes/admin/relatorioOtimizadoRoutes.js
const express = require('express');
const relatorioOtimizadoController = require('../../controllers/admin/relatorioOtimizadoController');
const { verificarToken } = require('../../middlewares/auth');
const { verificarPermissao } = require('../../middlewares/permissaoMiddleware');

const router = express.Router();

router.use(verificarToken);

// Rotas otimizadas com materialized views
router.get('/relatorios-rapidos/receita', verificarPermissao('relatorios', 'visualizar'), relatorioOtimizadoController.getReceitaRapida);
router.get('/relatorios-rapidos/ocupacao', verificarPermissao('relatorios', 'visualizar'), relatorioOtimizadoController.getOcupacaoRapida);
router.get('/relatorios-rapidos/pagamentos', verificarPermissao('relatorios', 'visualizar'), relatorioOtimizadoController.getPagamentosRapidos);
router.get('/relatorios-rapidos/dashboard', verificarPermissao('relatorios', 'visualizar'), relatorioOtimizadoController.getDashboardRapido);

// Rotas de administração
router.post('/relatorios-rapidos/refresh', verificarPermissao('admin', '*'), relatorioOtimizadoController.refreshViews);
router.get('/relatorios-rapidos/performance', verificarPermissao('admin', '*'), relatorioOtimizadoController.getPerformanceMetrics);

module.exports = router;