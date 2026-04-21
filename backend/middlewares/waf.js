// WAF SIMPLES - Proteção contra ataques comuns
const sqlInjectionPatterns = [
  /' OR '1'='1/i,
  /1' OR '1'='1/i,
  /(\'|\")\s+or\s+\'1\'\s*=\s*\'1\'/i,
  /(\'|\")\s+or\s+1\s*=\s*1/i,
  /1\s*\'?\s*or\s*\'\s*1\'\s*=\s*\'1\'/i,
  /(\'|\")(\s*)(or|and)(\s*)([0-9]+)(\s*)(=)(\s*)([0-9]+)/i,
  /(\'|\")(\s*)(or|and)(\s*)([0-9]+)(\s*)(=)(\s*)(\'|\")/i,
  /union\s+select/i,
  /drop\s+table/i,
  /insert\s+into/i,
  /delete\s+from/i,
  /xp_/i,
  /exec\s+sp_/i,
  /--/,
  /;.*--/,
  /(\'|\")\s*or\s*(\'|\")\s*=\s*(\'|\")/i,
  /or\s+1\s*=\s*1/i
];

const xssPatterns = [
  /<script[^>]*>/i,
  /javascript:/i,
  /onload\s*=/i,
  /onerror\s*=/i,
  /eval\s*\(/i,
  /alert\s*\(/i
];

const pathTraversalPatterns = [
  /\.\.[\\/]/,
  /\/etc\/passwd/i,
  /\/etc\/shadow/i,
  /c:\\windows/i
];

function isMalicious(input) {
  if (!input || typeof input !== 'string') return false;
  
  for (const pattern of sqlInjectionPatterns) {
    if (pattern.test(input)) return true;
  }
  
  for (const pattern of xssPatterns) {
    if (pattern.test(input)) return true;
  }
  
  for (const pattern of pathTraversalPatterns) {
    if (pattern.test(input)) return true;
  }
  
  return false;
}

function scanRequest(obj) {
  if (!obj) return false;
  
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === 'string') {
      if (isMalicious(value)) return true;
    } else if (typeof value === 'object') {
      if (scanRequest(value)) return true;
    }
  }
  return false;
}

const wafMiddleware = (req, res, next) => {
  // Ignorar health check
  if (req.path === '/api/health') {
    return next();
  }
  
  // Verificar query string
  if (scanRequest(req.query)) {
    console.warn(`?? WAF - Ataque detectado (query): ${req.method} ${req.url}`);
    return res.status(403).json({ success: false, message: 'Requisição bloqueada' });
  }
  
  // Verificar body
  if (req.body && scanRequest(req.body)) {
    console.warn(`?? WAF - Ataque detectado (body): ${req.method} ${req.url}`);
    return res.status(403).json({ success: false, message: 'Requisição bloqueada' });
  }
  
  next();
};

module.exports = wafMiddleware;
