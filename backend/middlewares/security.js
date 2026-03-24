// =====================================================
// HOTEL PARADISE - SECURITY MIDDLEWARES
// Versão: 1.0.0
// =====================================================

const helmet = require('helmet');
const cors = require('cors');

/**
 * Configuração do CORS
 * Permite apenas origens confiáveis
 */
const corsOptions = {
  origin: (origin, callback) => {
    // Lista de origens permitidas
    const allowedOrigins = [
      'http://localhost:5173',  // Frontend Vite
      'http://localhost:3000',  // Frontend React padrão
      'http://localhost:5000',  // Backend local
      'https://hotelparadise.com' // Produção
    ];

    // Permitir requisições sem origin (ex: Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado pelo CORS'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 horas
};

/**
 * Middleware de segurança
 * Aplica Helmet e CORS
 */
const securityMiddleware = (app) => {
  // Configuração do Helmet (proteção de headers)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https://api.hotelparadise.com"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: []
        }
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );

  // CORS
  app.use(cors(corsOptions));

  // Headers adicionais de segurança
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  });
};

/**
 * Rate limiting (proteção contra ataques de força bruta)
 */
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas por IP
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP
  message: {
    success: false,
    message: 'Limite de requisições excedido. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  securityMiddleware,
  corsOptions,
  authLimiter,
  apiLimiter
};