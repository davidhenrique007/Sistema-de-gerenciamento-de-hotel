// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/auth');
import reservaAdminRoutes from './admin/reservaAdminRoutes.js';


// Todas as rotas admin requerem autenticação e role admin
router.use(authMiddleware);

// Confirmar pagamento em dinheiro
router.post('/pagamento-dinheiro/confirmar', adminController.confirmarPagamentoDinheiro);

// Executar job manualmente
router.post('/jobs/liberar-quartos', adminController.executarJob);

// Verificar status das reservas pendentes
router.get('/reservas/pendentes', adminController.verificarStatusPendentes);

module.exports = router;