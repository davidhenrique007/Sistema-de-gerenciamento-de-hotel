const express = require('express');
const router = express.Router();
const { verificarToken } = require('../../middlewares/auth');
const twoFactorController = require('../../controllers/twoFactorController');

// Todas as rotas requerem autenticação
router.use(verificarToken);

// Setup 2FA
router.post('/2fa/setup', twoFactorController.setup);

// Verificar e ativar 2FA
router.post('/2fa/verify', twoFactorController.verify);

// Validar código durante login (rota pública)
router.post('/2fa/validate', twoFactorController.validate);

// Desativar 2FA
router.post('/2fa/disable', twoFactorController.disable);

// Gerar novos recovery codes
router.post('/2fa/recovery-codes', twoFactorController.getRecoveryCodes);

// Verificar status
router.get('/2fa/status', twoFactorController.status);

module.exports = router;