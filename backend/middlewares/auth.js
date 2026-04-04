const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  console.log('🔑 Verificando token...');
  console.log('   Headers:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ Token não fornecido ou formato inválido');
    return res.status(401).json({ 
      success: false, 
      message: 'Token não fornecido' 
    });
  }

  const token = authHeader.split(' ')[1];
  console.log('   Token recebido:', token.substring(0, 20) + '...');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hotel-paradise-secret');
    console.log('✅ Token válido! Usuário:', decoded.email);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Token inválido:', error.message);
    return res.status(401).json({ 
      success: false, 
      message: 'Token inválido ou expirado' 
    });
  }
};

const verificarRole = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário não autenticado' 
      });
    }
    
    console.log('🔐 Verificando role...');
    console.log('   Role do usuário:', req.user.role);
    console.log('   Roles permitidas:', rolesPermitidos);
    
    if (!rolesPermitidos.includes(req.user.role)) {
      console.log('❌ Acesso negado - role não permitida');
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado. Permissão insuficiente.' 
      });
    }
    
    console.log('✅ Role autorizada');
    next();
  };
};

module.exports = { verificarToken, verificarRole };
