const twoFactorService = require('../services/twoFactorService');
const { generateQRCode } = require('../utils/qrcode');
const User2FA = require('../models/User2FA');

class TwoFactorController {
  async setup(req, res) {
    try {
      const userId = req.user.id;
      const userEmail = req.user.email;

      const existing = await User2FA.findByUserId(userId);
      if (existing?.enabled) {
        return res.status(400).json({
          success: false,
          message: '2FA já está ativado para esta conta'
        });
      }

      const { secret, otpauth_url } = twoFactorService.generateSecret(userEmail);
      const recoveryCodes = twoFactorService.generateRecoveryCodes(8);
      const hashedRecoveryCodes = twoFactorService.hashRecoveryCodes(recoveryCodes);
      
      await User2FA.create(userId, secret, hashedRecoveryCodes);
      
      const qrCode = await generateQRCode(otpauth_url);

      res.json({
        success: true,
        data: {
          secret,
          qrCode,
          recoveryCodes
        }
      });
    } catch (error) {
      console.error('Erro no setup 2FA:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao configurar 2FA'
      });
    }
  }

  async verify(req, res) {
    try {
      const userId = req.user.id;
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Código de verificação é obrigatório'
        });
      }

      const user2fa = await User2FA.findByUserId(userId);
      if (!user2fa || !user2fa.secret) {
        return res.status(400).json({
          success: false,
          message: '2FA não está configurado'
        });
      }

      const isValid = twoFactorService.verifyCode(user2fa.secret, token);
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Código inválido. Tente novamente.'
        });
      }

      await User2FA.enable(userId);

      res.json({
        success: true,
        message: '2FA ativado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao verificar 2FA:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao verificar código'
      });
    }
  }

  async validate(req, res) {
    try {
      const userId = req.body.userId || req.user?.id;
      const { token, recoveryCode } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Usuário não identificado'
        });
      }

      const user2fa = await User2FA.findByUserId(userId);
      
      if (!user2fa?.enabled) {
        return res.json({
          success: true,
          verified: true,
          message: '2FA não está ativo para este usuário'
        });
      }

      let verified = false;

      if (token) {
        verified = twoFactorService.verifyCode(user2fa.secret, token);
      } else if (recoveryCode) {
        const recoveryCodes = user2fa.recovery_codes;
        const index = twoFactorService.verifyRecoveryCode(recoveryCode, recoveryCodes);
        
        if (index !== null) {
          verified = true;
          const newRecoveryCodes = [...recoveryCodes];
          newRecoveryCodes.splice(index, 1);
          await User2FA.updateRecoveryCodes(userId, newRecoveryCodes);
        }
      }

      if (!verified) {
        return res.status(401).json({
          success: false,
          verified: false,
          message: 'Código inválido'
        });
      }

      res.json({
        success: true,
        verified: true,
        message: 'Verificação bem-sucedida'
      });
    } catch (error) {
      console.error('Erro ao validar 2FA:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao validar código'
      });
    }
  }

  async disable(req, res) {
    try {
      const userId = req.user.id;
      const { token } = req.body;

      const user2fa = await User2FA.findByUserId(userId);
      
      if (user2fa?.enabled) {
        if (!token) {
          return res.status(400).json({
            success: false,
            message: 'Código 2FA é obrigatório para desativar'
          });
        }

        const isValid = twoFactorService.verifyCode(user2fa.secret, token);
        if (!isValid) {
          return res.status(400).json({
            success: false,
            message: 'Código inválido'
          });
        }
      }

      await User2FA.disable(userId);

      res.json({
        success: true,
        message: '2FA desativado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao desativar 2FA:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao desativar 2FA'
      });
    }
  }

  async getRecoveryCodes(req, res) {
    try {
      const userId = req.user.id;
      const { token } = req.body;

      const user2fa = await User2FA.findByUserId(userId);
      
      if (!user2fa?.enabled) {
        return res.status(400).json({
          success: false,
          message: '2FA não está ativo'
        });
      }

      const isValid = twoFactorService.verifyCode(user2fa.secret, token);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Código inválido'
        });
      }

      const newRecoveryCodes = twoFactorService.generateRecoveryCodes(8);
      const hashedCodes = twoFactorService.hashRecoveryCodes(newRecoveryCodes);
      await User2FA.updateRecoveryCodes(userId, hashedCodes);

      res.json({
        success: true,
        data: { recoveryCodes: newRecoveryCodes }
      });
    } catch (error) {
      console.error('Erro ao gerar recovery codes:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao gerar códigos de recuperação'
      });
    }
  }

  async status(req, res) {
    try {
      const userId = req.user.id;
      const user2fa = await User2FA.findByUserId(userId);

      res.json({
        success: true,
        data: {
          enabled: user2fa?.enabled || false
        }
      });
    } catch (error) {
      console.error('Erro ao verificar status 2FA:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao verificar status'
      });
    }
  }
}

module.exports = new TwoFactorController();