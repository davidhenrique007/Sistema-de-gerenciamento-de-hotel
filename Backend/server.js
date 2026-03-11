// =====================================================
// HOTEL PARADISE - SERVIDOR PRINCIPAL
// Versão: 1.0.0
// Descrição: Entry point da aplicação backend
// =====================================================

// =====================================================
// IMPORTAÇÕES
// =====================================================
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('./config/database');

// =====================================================
// INICIALIZAÇÃO
// =====================================================
const app = express();
const PORT = process.env.PORT || 5000;

// =====================================================
// CONFIGURAÇÕES DE SEGURANÇA
// =====================================================

// Helmet: protege contra vulnerabilidades conhecidas
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS: permite requisições do frontend
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL || 'https://hotelparadise.com'
        : ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400 // 24 horas
};
app.use(cors(corsOptions));

// Compressão de respostas
app.use(compression());

// Rate limiting: evita ataques de força bruta
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite por IP
    message: {
        success: false,
        message: 'Muitas requisições deste IP, tente novamente em 15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// Limite mais restrito para autenticação
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'Muitas tentativas de login, tente novamente em 15 minutos'
    }
});
app.use('/api/auth/login', authLimiter);

// =====================================================
// MIDDLEWARES DE PARSING E LOGGING
// =====================================================

// Logging (diferente para cada ambiente)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Parsing de JSON e URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =====================================================
// ROTAS PÚBLICAS
// =====================================================

// Rota raiz
app.get('/', (req, res) => {
    res.json({
        success: true,
        data: {
            name: 'Hotel Paradise API',
            version: '1.0.0',
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
            documentation: '/api/docs',
            health: '/health'
        }
    });
});

// Rota de saúde (health check)
app.get('/health', async (req, res) => {
    const dbHealth = await db.healthCheck();
    
    res.json({
        success: true,
        data: {
            status: 'OK',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            memory: process.memoryUsage(),
            database: dbHealth
        }
    });
});

// Rota de teste do banco
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW() as current_time, current_database() as database');
        res.json({
            success: true,
            message: '✅ Conexão com banco de dados funcionando!',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('❌ Erro ao testar banco:', error);
        res.status(500).json({
            success: false,
            message: 'Erro na conexão com banco de dados',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// =====================================================
// ROTAS DA API (serão implementadas nos próximos dias)
// =====================================================

// Aqui vamos importar as rotas dos módulos
// const authRoutes = require('./routes/authRoutes');
// const guestRoutes = require('./routes/guestRoutes');
// const roomRoutes = require('./routes/roomRoutes');
// const reservationRoutes = require('./routes/reservationRoutes');
// const paymentRoutes = require('./routes/paymentRoutes');

// app.use('/api/auth', authRoutes);
// app.use('/api/guests', guestRoutes);
// app.use('/api/rooms', roomRoutes);
// app.use('/api/reservations', reservationRoutes);
// app.use('/api/payments', paymentRoutes);

// =====================================================
// TRATAMENTO DE ERROS
// =====================================================

// 404 - Rota não encontrada
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Rota não encontrada',
        path: req.path
    });
});

// Middleware de erro global
app.use((err, req, res, next) => {
    console.error('❌ Erro:', err);
    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Erro interno do servidor';
    
    res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? {
            stack: err.stack,
            details: err
        } : undefined,
        timestamp: new Date().toISOString()
    });
});

// =====================================================
// INICIALIZAÇÃO DO SERVIDOR
// =====================================================
const server = app.listen(PORT, () => {
    console.log('\n=================================');
    console.log('🚀 HOTEL PARADISE - BACKEND');
    console.log('=================================');
    console.log(`📡 Servidor: http://localhost:${PORT}`);
    console.log(`🔧 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💾 Banco: ${process.env.DB_NAME} em ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`📋 Documentação: http://localhost:${PORT}/`);
    console.log(`❤️ Health check: http://localhost:${PORT}/health`);
    console.log('=================================\n');
});

// =====================================================
// TRATAMENTO DE ENCERRAMENTO GRACEFUL
// =====================================================
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 Recebido ${signal}, fechando conexões...`);
    
    server.close(() => {
        console.log('✅ Servidor HTTP encerrado');
    });
    
    try {
        await db.pool.end();
        console.log('✅ Conexões com banco de dados encerradas');
        process.exit(0);
    } catch (err) {
        console.error('❌ Erro ao encerrar conexões:', err);
        process.exit(1);
    }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;