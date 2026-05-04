// backend/routes/admin/financeiroRoutes.js
const express = require('express');
const financeiroController = require('../../controllers/admin/financeiroController');
const { verificarToken } = require('../../middlewares/auth');
const { verificarPermissao } = require('../../middlewares/permissaoMiddleware');

const router = express.Router();

router.use(verificarToken);

router.get('/financeiro/dashboard', verificarPermissao('relatorios', 'visualizar'), financeiroController.getDashboard);
router.get('/financeiro/cashflow', verificarPermissao('relatorios', 'visualizar'), financeiroController.getCashflow);

module.exports = router;