// =====================================================
// HOTEL PARADISE - AUTH ROUTES
// Versão: 1.1.0 (COMPLETO)
// =====================================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middlewares/security');

// =====================================================
// ROTAS PÚBLICAS
// =====================================================

// Login de admin (com rate limit) - NOVA ROTA!
router.post('/admin/login', authLimiter, authController.loginAdmin);

// Login normal (para clientes)
router.post('/login', authLimiter, authController.login);

// Refresh token
router.post('/refresh-token', authController.refreshToken);

// Logout
router.post('/logout', authController.logout);

// Esqueci senha
router.post('/forgot-password', authLimiter, authController.forgotPassword);

// Resetar senha
router.post('/reset-password', authLimiter, authController.resetPassword);

module.exports = router;