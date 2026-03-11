// =====================================================
// HOTEL PARADISE - AUTH CONTROLLER
// Versão: 1.0.0
// =====================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { models } = require('../models');

/**
 * Gera tokens JWT
 * @param {Object} user - Usuário
 * @returns {Object} Tokens
 */
const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  return { accessToken, refreshToken };
};

/**
 * Login do usuário
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validação básica
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário por email
    const user = await models.users.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Verificar se usuário está ativo
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Usuário inativo. Contate o administrador.'
      });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Atualizar last_login
    await models.users.update(user.id, { last_login: new Date() });

    // Gerar tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Remover senha do objeto de retorno
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no servidor'
    });
  }
};

/**
 * Refresh token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token é obrigatório'
      });
    }

    // Verificar refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    // Buscar usuário
    const user = await models.users.findById(decoded.id);

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo'
      });
    }

    // Gerar novos tokens
    const tokens = generateTokens(user);

    res.json({
      success: true,
      message: 'Token renovado com sucesso',
      data: tokens
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido ou expirado'
      });
    }

    console.error('Erro no refresh token:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no servidor'
    });
  }
};

/**
 * Logout (apenas para cliente limpar tokens)
 */
const logout = async (req, res) => {
  // Em uma implementação real, você pode invalidar o token no banco
  res.json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
};

/**
 * Esqueci senha
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    const user = await models.users.findByEmail(email);

    // Não revelar se o usuário existe ou não (segurança)
    if (user) {
      // Gerar token de reset
      const resetToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // TODO: Enviar email com link de reset
      // http://frontend/reset-password?token=...
      
      console.log(`Link de reset para ${email}: /reset-password?token=${resetToken}`);
    }

    // Sempre retornar a mesma mensagem
    res.json({
      success: true,
      message: 'Se o email existir, você receberá instruções para redefinir sua senha'
    });
  } catch (error) {
    console.error('Erro no forgot password:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no servidor'
    });
  }
};

/**
 * Resetar senha
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token e nova senha são obrigatórios'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuário
    const user = await models.users.findById(decoded.id);

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // Atualizar senha
    await models.users.update(user.id, { password_hash });

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso'
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    console.error('Erro no reset password:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no servidor'
    });
  }
};

module.exports = {
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword
};