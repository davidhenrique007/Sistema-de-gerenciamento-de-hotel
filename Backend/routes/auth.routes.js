// =====================================================
// HOTEL PARADISE - AUTH ROUTES
// Versão: 1.0.0
// =====================================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authLimiter } = require('../middlewares/security');

// =====================================================
// ROTAS PÚBLICAS DE AUTENTICAÇÃO
// =====================================================

// Login (com rate limit)
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