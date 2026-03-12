// =====================================================
// HOTEL PARADISE - MAIN ROUTES (CORRIGIDO)
// Versão: 1.1.0
// =====================================================

const express = require('express');
const router = express.Router();

// Importar middlewares
const { apiLimiter } = require('../middlewares/security');
const { authenticate } = require('../middlewares/auth');

// Importar rotas específicas
const usersRoutes = require('./users.routes');
const roomsRoutes = require('./rooms.routes');
const authRoutes = require('./auth.routes');
const clienteRoutes = require('./clienteRoutes');

// =====================================================
// ROTAS PÚBLICAS
// =====================================================
router.use('/auth', apiLimiter, authRoutes);
router.use('/clientes', clienteRoutes); // ✅ ROTA PÚBLICA (identificar)

// =====================================================
// ROTAS PROTEGIDAS (requerem autenticação)
// =====================================================
router.use('/users', authenticate, apiLimiter, usersRoutes);
router.use('/rooms', authenticate, apiLimiter, roomsRoutes);
router.use('/admin/clientes', authenticate, clienteRoutes); // ✅ ROTA ADMIN

// =====================================================
// ROTA DE SAÚDE (pública)
// =====================================================
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API está funcionando!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;