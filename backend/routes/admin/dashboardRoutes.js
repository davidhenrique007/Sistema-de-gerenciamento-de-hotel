const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/admin/dashboardController');
const { verificarToken, verificarRole } = require('../../middlewares/auth');

// Rota de teste sem autenticação (para verificar se o endpoint existe)
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Dashboard API funcionando' });
});

// Todas as rotas do dashboard exigem autenticação
router.get('/metrics', verificarToken, verificarRole(['admin', 'recepcionista', 'financeiro']), dashboardController.getMetrics);

router.get('/ocupacao-por-tipo', verificarToken, verificarRole(['admin', 'recepcionista']), dashboardController.getOcupacaoPorTipo);

module.exports = router;
