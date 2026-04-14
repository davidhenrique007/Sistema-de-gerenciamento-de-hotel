const jwt = require('jsonwebtoken');
<<<<<<< HEAD
const db = require('../config/database');

const registrarLogin = async (userId, ip, userAgent) => {
  try {
    const result = await db.query(`
      INSERT INTO user_sessions (user_id, login_time, ip_address, user_agent, is_active)
      VALUES ($1, NOW(), $2, $3, true)
      RETURNING id
    `, [userId, ip, userAgent]);

    await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [userId]);

    console.log(`✅ Login registrado para usuário ${userId}`);
    return result.rows[0].id;
  } catch(e) {
    console.error('Erro ao registrar login:', e.message);
    return null;
  }
};

const registrarLogout = async (userId, ip) => {
  try {
    const session = await db.query(`
      SELECT id, login_time FROM user_sessions
      WHERE user_id = $1 AND logout_time IS NULL
      ORDER BY login_time DESC LIMIT 1
    `, [userId]);

    if (session.rows.length > 0) {
      const sessionId = session.rows[0].id;
      const loginTime = new Date(session.rows[0].login_time);
      const logoutTime = new Date();
      const duration = Math.floor((logoutTime - loginTime) / 1000);
      
      if (duration > 0) {
        await db.query(`
          UPDATE user_sessions
          SET logout_time = NOW(),
              session_duration = $1,
              is_active = false
          WHERE id = $2
        `, [duration, sessionId]);

        await db.query(`
          UPDATE users
          SET last_logout = NOW(),
              total_session_time = COALESCE(total_session_time, 0) + $1
          WHERE id = $2
        `, [duration, userId]);

        console.log(`✅ Logout registrado: usuário ${userId} ficou online por ${Math.floor(duration/60)} minutos`);
        return duration;
      }
    } else {
      console.log(`⚠️ Nenhuma sessão ativa encontrada para usuário ${userId}`);
    }
  } catch(e) {
    console.error('Erro ao registrar logout:', e.message);
  }
  return null;
};

const verificarToken = async (req, res, next) => {
=======

const verificarToken = (req, res, next) => {
>>>>>>> origin/main
  const authHeader = req.headers.authorization;
  const jwtSecret = process.env.JWT_SECRET || 'hotel-paradise-super-secret-key';

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token não fornecido'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);
<<<<<<< HEAD
    
    const userResult = await db.query(
      'SELECT id, name, email, role, is_active FROM users WHERE id = $1',
      [decoded.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Utilizador não encontrado'
      });
    }
    
    const user = userResult.rows[0];
    
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada. Contacte o administrador.'
      });
    }
    
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active
    };
    
=======
    req.user = decoded;
>>>>>>> origin/main
    next();
  } catch (error) {
    console.error('Erro ao verificar token:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado'
    });
  }
};

const verificarRole = (rolesPermitidos) => {
<<<<<<< HEAD
  return async (req, res, next) => {
=======
  return (req, res, next) => {
>>>>>>> origin/main
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    if (!rolesPermitidos.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Permissão insuficiente.'
      });
    }

    next();
  };
};

<<<<<<< HEAD
module.exports = {
  verificarToken,
  verificarRole,
  registrarLogin,
  registrarLogout
};
=======
module.exports = { verificarToken, verificarRole };
>>>>>>> origin/main
