// backend/routes/admin/reservaAdminRoutes.js
const express = require('express');
const reservaAdminController = require('../../controllers/admin/reservaAdminController');
const { verificarToken } = require('../../middlewares/auth'); // ✅ CAMINHO CORRETO

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(verificarToken);

// ==================== ROTAS EXISTENTES ====================
router.get('/reservas', reservaAdminController.listarReservas);
router.get('/reservas/:id/detalhes', reservaAdminController.obterDetalhesReserva);

// ==================== NOVAS ROTAS - AÇÕES ADMINISTRATIVAS ====================
router.post('/reservas/:id/cancelar', reservaAdminController.cancelarReserva);
router.put('/reservas/:id/editar', reservaAdminController.editarReserva);
router.post('/reservas/:id/confirmar-pagamento', reservaAdminController.confirmarPagamento);
router.post('/reservas/:id/checkin', reservaAdminController.realizarCheckin);
router.post('/reservas/:id/checkout', reservaAdminController.realizarCheckout);
router.post('/reservas/:id/reenviar-recibo', reservaAdminController.reenviarRecibo);

module.exports = router;