const rateLimit = require('express-rate-limit');

// Cache em memória para tracking de IPs bloqueados
const blockedIPs = new Map();

// Limite padrão para todos endpoints
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // limite de 100 requests por minuto
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em 1 minuto.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Usar IP ou user ID se autenticado
    return req.user?.id || req.ip;
  },
  skip: (req) => {
    // Pular rate limit para health check
    return req.path === '/api/health';
  }
});

// Limite mais rigoroso para endpoints sensíveis
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // apenas 5 tentativas
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  skipSuccessfulRequests: true, // Não contar logins bem-sucedidos
  keyGenerator: (req) => req.ip
});

// Limite para criação de reservas
const reservaLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // máximo 10 reservas por hora
  message: {
    success: false,
    message: 'Limite de reservas excedido. Tente novamente mais tarde.'
  },
  keyGenerator: (req) => req.user?.id || req.ip
});

// Middleware para verificar IP bloqueado
const checkBlockedIP = (req, res, next) => {
  const ip = req.ip;
  const blocked = blockedIPs.get(ip);
  
  if (blocked && blocked.expires > Date.now()) {
    return res.status(429).json({
      success: false,
      message: `IP bloqueado. Tente novamente em ${Math.ceil((blocked.expires - Date.now()) / 60000)} minutos.`
    });
  }
  
  next();
};

// Função para bloquear IP temporariamente
const blockIP = (ip, durationMinutes = 10) => {
  blockedIPs.set(ip, {
    expires: Date.now() + (durationMinutes * 60 * 1000),
    reason: 'Ataque detectado'
  });
  
  console.warn(`🚫 IP ${ip} bloqueado por ${durationMinutes} minutos`);
};

module.exports = {
  globalLimiter,
  authLimiter,
  reservaLimiter,
  checkBlockedIP,
  blockIP
};
