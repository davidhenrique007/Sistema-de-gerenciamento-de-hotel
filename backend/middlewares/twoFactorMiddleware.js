const User2FA = require('../models/User2FA');

async function require2FA(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const user2fa = await User2FA.findByUserId(req.user.id);
    
    if (user2fa?.enabled) {
      const twoFactorVerified = req.session?.twoFactorVerified || req.headers['x-2fa-verified'] === 'true';
      
      if (!twoFactorVerified) {
        return res.status(403).json({
          success: false,
          requires2FA: true,
          message: 'Verificação de dois fatores necessária'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Erro no middleware 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar 2FA'
    });
  }
}

module.exports = { require2FA };