// =====================================================
// HOTEL PARADISE - MAIN ROUTES
// =====================================================

const express = require('express');
const router = express.Router();

// =====================================================
// MIDDLEWARES SIMPLIFICADOS
// =====================================================

// API Limiter simplificado
const apiLimiter = (req, res, next) => {
    next();
};

// Autenticação simplificada
const authenticate = (req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        req.user = {
            id: '29ee2d94-1cbd-4d85-acb7-ad24819011f2',
            email: 'admin@hotelparadise.com',
            role: 'admin'
        };
        return next();
    }
    
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: true, message: 'Não autorizado' });
    }
    
    next();
};

// =====================================================
// IMPORTAR ROTAS (COM TRY/CATCH)
// =====================================================

let usersRoutes, roomsRoutes, authRoutes, clienteRoutes, quartoRoutes, reservaRoutes, pagamentoRoutes, webhookRoutes;

try {
    usersRoutes = require('./users.routes');
} catch (e) { 
    usersRoutes = express.Router(); 
    console.log('⚠️ users.routes não encontrado'); 
}

try {
    roomsRoutes = require('./rooms.routes');
} catch (e) { 
    roomsRoutes = express.Router(); 
    console.log('⚠️ rooms.routes não encontrado'); 
}

try {
    authRoutes = require('./auth.routes');
} catch (e) { 
    authRoutes = express.Router(); 
    console.log('⚠️ auth.routes não encontrado'); 
}

try {
    clienteRoutes = require('./clienteRoutes');
} catch (e) { 
    clienteRoutes = express.Router(); 
    console.log('⚠️ clienteRoutes não encontrado'); 
}

try {
    quartoRoutes = require('./quartoRoutes');
} catch (e) { 
    quartoRoutes = express.Router(); 
    console.log('⚠️ quartoRoutes não encontrado'); 
}

try {
    reservaRoutes = require('./reservaRoutes');
} catch (e) { 
    reservaRoutes = express.Router(); 
    console.log('⚠️ reservaRoutes não encontrado'); 
}

try {
    pagamentoRoutes = require('./pagamentoRoutes');
} catch (e) { 
    pagamentoRoutes = express.Router(); 
    console.log('⚠️ pagamentoRoutes não encontrado'); 
}

try {
    webhookRoutes = require('./webhookRoutes');
} catch (e) { 
    webhookRoutes = express.Router(); 
    console.log('⚠️ webhookRoutes não encontrado'); 
}

// =====================================================
// ROTAS PÚBLICAS
// =====================================================
router.use('/auth', authRoutes);
router.use('/clientes', clienteRoutes);
router.use('/quartos', quartoRoutes);
router.use('/reservas', reservaRoutes);
router.use('/pagamentos', pagamentoRoutes);
router.use('/webhooks', webhookRoutes);

// =====================================================
// ROTAS PROTEGIDAS
// =====================================================
router.use('/users', authenticate, usersRoutes);
router.use('/rooms', authenticate, roomsRoutes);

// =====================================================
// ROTA DE SAÚDE
// =====================================================
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API está funcionando!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      clientes: '/api/clientes',
      quartos: '/api/quartos/disponiveis',
      reservas: '/api/reservas',
      pagamentos: '/api/pagamentos/mpesa/iniciar',
      webhooks: '/api/webhooks/mpesa/confirmar'
    }
  });
});

module.exports = router;
