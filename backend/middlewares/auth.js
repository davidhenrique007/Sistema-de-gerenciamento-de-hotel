const jwt = require('jsonwebtoken');
const pool = require('../config/database');  // ← Adicionar

const verificarToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: true, message: 'Token não fornecido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hotel-paradise-secret');
    
    req.user = {
      id: decoded.id,
      guest_id: decoded.guest_id,
      telefone: decoded.telefone,
      nome: decoded.nome,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    console.error('❌ Erro ao verificar token:', error.message);
    return res.status(401).json({ error: true, message: 'Token inválido ou expirado' });
  }
};

const verificarRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: true, message: 'Acesso negado' });
    }
    
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ error: true, message: 'Permissão insuficiente' });
    }
  };
};

// ==================== NOVAS FUNÇÕES ====================

async function registrarLogin(userId, ip, userAgent) {
  try {
    // Fechar sessões anteriores ainda abertas
    await pool.query(`
      UPDATE user_sessions 
      SET logout_time = NOW() 
      WHERE user_id = $1 AND logout_time IS NULL
    `, [userId]);

    // Criar nova sessão
    await pool.query(`
      INSERT INTO user_sessions (user_id, login_time, ip_address, user_agent)
      VALUES ($1, NOW(), $2, $3)
    `, [userId, ip, userAgent]);

    console.log(`✅ Sessão registrada para usuário ${userId}`);
  } catch (error) {
    console.error('❌ Erro ao registrar login:', error.message);
  }
}

async function registrarLogout(userId, ip) {
  try {
    const result = await pool.query(`
      UPDATE user_sessions 
      SET logout_time = NOW() 
      WHERE user_id = $1 AND logout_time IS NULL
      RETURNING EXTRACT(EPOCH FROM (NOW() - login_time)) as duracao_segundos
    `, [userId]);

    if (result.rows.length > 0) {
      return result.rows[0].duracao_segundos;
    }
    return 0;
  } catch (error) {
    console.error('❌ Erro ao registrar logout:', error.message);
    return 0;
  }
}

module.exports = { 
  verificarToken, 
  verificarRole,
  registrarLogin,    // ← Exportar
  registrarLogout    // ← Exportar
};