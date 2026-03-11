// =====================================================
// HOTEL PARADISE - AUTHENTICATION MIDDLEWARE
// Versão: 1.0.0
// =====================================================

const jwt = require('jsonwebtoken');
const { models } = require('../models');

// 🔴🔴🔴 ADICIONE ESTA LINHA AQUI (após o require dos models) 🔴🔴🔴
const { db } = require('../models');

/**
 * Middleware de autenticação JWT
 * Verifica se o token é válido e adiciona o usuário à requisição
 */
const authenticate = async (req, res, next) => {
  try {
    // 1. Obter token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verificar se o token existe
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    // 3. Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Buscar usuário no banco
    const user = await models.users.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Usuário inativo'
      });
    }

    // 5. Adicionar usuário à requisição (sem senha)
    const { password_hash, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;

    // 6. Configurar usuário para auditoria
    await setCurrentUser(user.id);

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    console.error('Erro na autenticação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno no servidor'
    });
  }
};

/**
 * Middleware de autorização por perfil
 * @param {...string} allowedRoles - Perfis permitidos
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Permissão insuficiente.'
      });
    }

    next();
  };
};

/**
 * 🔴🔴🔴 SUBSTITUA a função setCurrentUser existente por esta versão melhorada 🔴🔴🔴
 */
const setCurrentUser = async (userId) => {
  try {
    // Verifica se db existe antes de usar
    if (db && db.raw) {
      await db.raw(`SET app.current_user_id = '${userId}'`);
    }
  } catch (error) {
    // Não loga em ambiente de teste para não poluir
    if (process.env.NODE_ENV !== 'test') {
      console.error('Erro ao definir usuário para auditoria:', error);
    }
  }
};

/**
 * Middleware opcional de autenticação
 * Não bloqueia se não houver token, apenas adiciona user se existir
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await models.users.findById(decoded.id);
      
      if (user && user.is_active) {
        const { password_hash, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
        await setCurrentUser(user.id);
      }
    }
    
    next();
  } catch (error) {
    // Se o token for inválido, apenas continua sem usuário
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};