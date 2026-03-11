// =====================================================
// HOTEL PARADISE - SERVIDOR PRINCIPAL (ATUALIZADO)
// Versão: 1.1.0
// =====================================================

const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const db = require('./config/database');
const routes = require('./routes');
const { securityMiddleware } = require('./middlewares/security');

const app = express();
const PORT = process.env.PORT || 5000;

// =====================================================
// MIDDLEWARES
// =====================================================

// Segurança (Helmet + CORS)
securityMiddleware(app);

// Compressão
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =====================================================
// ROTAS
// =====================================================

// Rotas da API
app.use('/api', routes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Hotel Paradise API',
      version: '1.1.0',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        rooms: '/api/rooms',
        health: '/api/health'
      }
    }
  });
});

// =====================================================
// TRATAMENTO DE ERROS
// =====================================================

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Erro global
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';
  
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });
});

// =====================================================
// INICIALIZAÇÃO
// =====================================================
const server = app.listen(PORT, () => {
  console.log('\n=================================');
  console.log('🚀 HOTEL PARADISE - BACKEND');
  console.log('=================================');
  console.log(`📡 Servidor: http://localhost:${PORT}`);
  console.log(`🔧 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📋 Documentação: http://localhost:${PORT}/`);
  console.log(`❤️ Health check: http://localhost:${PORT}/api/health`);
  console.log('=================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

async function gracefulShutdown(signal) {
  console.log(`\n🛑 Recebido ${signal}, fechando conexões...`);
  
  server.close(() => {
    console.log('✅ Servidor HTTP encerrado');
  });
  
  try {
    await db.pool.end();
    console.log('✅ Conexões com banco encerradas');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro ao encerrar:', err);
    process.exit(1);
  }
}

module.exports = app;