// =====================================================
// HOTEL PARADISE - MAIN ROUTES
// Versão: 1.0.0
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

// =====================================================
// ROTAS PÚBLICAS
// =====================================================
router.use('/auth', apiLimiter, authRoutes);

// =====================================================
// ROTAS PROTEGIDAS (requerem autenticação)
// =====================================================
router.use('/users', authenticate, apiLimiter, usersRoutes);
router.use('/rooms', authenticate, apiLimiter, roomsRoutes);

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