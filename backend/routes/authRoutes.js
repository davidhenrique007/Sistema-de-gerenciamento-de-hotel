const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota de login - SEM TRANSFORMAÇÃO
router.post('/login', authController.login);

// Rota de verificação de token
router.post('/verificar', authController.verificarToken);

// Rota de teste
router.get('/test', (req, res) => {
  res.json({
    success: true,
    token: 'test-token-123',
    user: { name: 'Teste', role: 'admin' }
  });
});

module.exports = router;
