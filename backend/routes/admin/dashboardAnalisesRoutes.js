// backend/routes/admin/dashboardAnalisesRoutes.js
const express = require('express');
const router = express.Router();
const dashboardAnalisesController = require('../../controllers/admin/dashboardAnalisesController');

router.get('/ocupacao-diaria', dashboardAnalisesController.getOcupacaoDiaria);
router.get('/receita-comparativa', dashboardAnalisesController.getReceitaComparativa);
router.get('/distribuicao-quartos', dashboardAnalisesController.getDistribuicaoQuartos);

module.exports = router;