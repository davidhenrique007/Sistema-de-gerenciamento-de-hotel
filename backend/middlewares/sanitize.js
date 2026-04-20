const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');

const deepSanitize = (obj) => {
  if (!obj) return obj;
  
  const sanitized = Array.isArray(obj) ? [] : {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      let cleaned = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
      sanitized[key] = cleaned;
    } 
    else if (typeof value === 'object' && value !== null) {
      sanitized[key] = deepSanitize(value);
    }
    else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = deepSanitize(req.body);
  }
  if (req.query) {
    req.query = deepSanitize(req.query);
  }
  if (req.params) {
    req.params = deepSanitize(req.params);
  }
  next();
};

const validateDataTypes = (req, res, next) => {
  const errors = [];
  
  // Verificar se body existe
  if (req.body) {
    if (req.body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
      errors.push('Email inválido');
    }
    
    if (req.body.phone && !/^[0-9+\-\s()]{9,15}$/.test(req.body.phone)) {
      errors.push('Telefone inválido');
    }
    
    if (req.body.totalPrice && (isNaN(req.body.totalPrice) || req.body.totalPrice < 0)) {
      errors.push('Preço inválido');
    }
    
    if (req.body.checkIn && req.body.checkOut) {
      const checkIn = new Date(req.body.checkIn);
      const checkOut = new Date(req.body.checkOut);
      
      if (isNaN(checkIn) || isNaN(checkOut)) {
        errors.push('Datas inválidas');
      }
      
      if (checkOut <= checkIn) {
        errors.push('Data de saída deve ser após data de entrada');
      }
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors
    });
  }
  
  next();
};

const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

module.exports = {
  sanitizeInput,
  validateDataTypes,
  securityHeaders,
  deepSanitize
};