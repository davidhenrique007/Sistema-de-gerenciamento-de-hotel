// =====================================================
// HOTEL PARADISE - SERVIDOR PRINCIPAL
// =====================================================

const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const db = require('./config/database');
const routes = require('./routes');
const { securityMiddleware } = require('./middlewares/security');
const { models } = require('./models');

const reservaRoutes = require('./routes/reservaRoutes');
const pagamentoRoutes = require('./routes/pagamentoRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const stripeRoutes = require('./routes/stripeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reciboRoutes = require('./routes/reciboRoutes');
const liberarQuartosJob = require('./services/jobs/liberarQuartosJob');

const app = express();
const PORT = process.env.PORT || 5000;

const seedUsers = async () => {
  try {
    console.log('🌱 Verificando usuários padrão...');
    
    const users = [
      { 
        name: 'Administrador', 
        email: 'admin@hotelparadise.com', 
        pass: 'admin123', 
        role: 'admin' 
      },
      { 
        name: 'Recepcionista', 
        email: 'recepcao@hotelparadise.com', 
        pass: 'receptionist123', 
        role: 'receptionist' 
      },
      { 
        name: 'Financeiro', 
        email: 'financeiro@hotelparadise.com', 
        pass: 'financeiro123', 
        role: 'financial' 
      }
    ];
    
    for (const u of users) {
      const exists = await models.users.findByEmail(u.email);
      
      if (!exists) {
        console.log(`  👤 Criando ${u.name}...`);
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(u.pass, salt);
        
        await models.users.create({ 
          name: u.name, 
          email: u.email, 
          password_hash: hash, 
          role: u.role, 
          is_active: true 
        });
        
        console.log(`  ✅ ${u.name} criado com sucesso!`);
      } else {
        console.log(`  ✅ ${u.name} já existe`);
      }
    }
    
    console.log('🌱 Seed de usuários concluído!\n');
  } catch (error) {
    console.error('❌ Erro no seed de usuários:', error);
  }
};

securityMiddleware(app);
app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api', routes);
app.use('/api', reservaRoutes);
app.use('/api/pagamentos', pagamentoRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/recibos', reciboRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Hotel Paradise API',
      version: '1.2.0',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        rooms: '/api/rooms',
        reservas: '/api/reservas',
        quartos: '/api/quartos/disponiveis',
        pagamentos: '/api/pagamentos/mpesa/iniciar',
        webhook: '/api/webhooks/mpesa/confirmar',
        health: '/api/health'
      }
    }
  });
});

app.get('/api/test-stripe', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Stripe endpoint funcionando!',
        stripeKey: process.env.STRIPE_SECRET_KEY ? 'Configurada' : 'Não configurada'
    });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

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

// Iniciar job de liberação de quartos
liberarQuartosJob.start('*/30 * * * *'); // A cada 30 minutos

const server = app.listen(PORT, async () => {
  console.log('\n=================================');
  console.log('🚀 HOTEL PARADISE - BACKEND');
  console.log('=================================');
  console.log(`📡 Servidor: http://localhost:${PORT}`);
  console.log(`🔧 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📋 Documentação: http://localhost:${PORT}/`);
  console.log(`❤️ Health check: http://localhost:${PORT}/api/health`);
  console.log(`🏨 Quartos disponíveis: http://localhost:${PORT}/api/quartos/disponiveis`);
  console.log(`📝 Reservas: http://localhost:${PORT}/api/reservas`);
  console.log(`💰 Pagamento M-Pesa: http://localhost:${PORT}/api/pagamentos/mpesa/iniciar`);
  console.log(`🔔 Webhook M-Pesa: http://localhost:${PORT}/api/webhooks/mpesa/confirmar`);
  console.log('=================================\n');

  await seedUsers();
});

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


