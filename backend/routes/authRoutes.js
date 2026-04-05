const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota de login para o frontend (formato esperado)
router.post('/login', authController.loginFrontend);

// Rota de login admin (sistema interno)
router.post('/admin/login', authController.loginAdmin);

// Rota de verificação de token
router.post('/verificar', authController.verificarToken);

// Rota de logout
router.post('/logout', authController.logout);

// Rota de refresh token
router.post('/refresh', authController.refreshToken);

// Rota de teste
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Auth route working' });
});

module.exports = router;
