const fs = require('fs');
const path = require('path');

const logStream = fs.createWriteStream(
  path.join(__dirname, '../logs/performance.log'),
  { flags: 'a' }
);

function performanceLogger(req, res, next) {
  const start = Date.now();
  const { method, originalUrl } = req;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    
    // Log em arquivo
    logStream.write(`${timestamp} | ${method} ${originalUrl} | ${duration}ms | ${res.statusCode}\n`);
    
    // Aviso se for lento
    if (duration > 500) {
      console.warn(`⚠️ Endpoint lento: ${method} ${originalUrl} - ${duration}ms`);
    }
  });
  
  next();
}

module.exports = { performanceLogger };