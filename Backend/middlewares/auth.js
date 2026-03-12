// =====================================================
// HOTEL PARADISE - AUTHENTICATION MIDDLEWARE
// Versão: 1.1.0 (COMPLETO)
// =====================================================

const jwt = require('jsonwebtoken');
const { models } = require('../models');
const { db } = require('../models'); // ← ADICIONADO!

// =====================================================
// CONSTANTES
// =====================================================
const TOKEN_EXPIRED_MESSAGE = 'Token expirado';
const TOKEN_INVALID_MESSAGE = 'Token inválido';
const TOKEN_MISSING_MESSAGE = 'Token não fornecido';

// =====================================================
// MIDDLEWARE DE AUTENTICAÇÃO
// =====================================================
const authenticate = async (req, res, next) => {
  try {
    // 1. Obter token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: TOKEN_MISSING_MESSAGE
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: TOKEN_MISSING_MESSAGE
      });
    }

    // 2. Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Buscar usuário no banco
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

    // 4. Adicionar usuário à requisição (sem senha)
    const { password_hash, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;

    // 5. Configurar usuário para auditoria
    await setCurrentUser(user.id);

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: TOKEN_INVALID_MESSAGE
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: TOKEN_EXPIRED_MESSAGE
      });
    }

    console.error('Erro na autenticação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno no servidor'
    });
  }
};

// =====================================================
// MIDDLEWARE DE AUTORIZAÇÃO
// =====================================================
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

// =====================================================
// FUNÇÃO PARA AUDITORIA (MELHORADA)
// =====================================================
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

// =====================================================
// MIDDLEWARE DE AUTENTICAÇÃO OPCIONAL
// =====================================================
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

// =====================================================
// EXPORTAÇÕES
// =====================================================
module.exports = {
  authenticate,
  authorize,
  optionalAuth
};