const express = require('express');
const router = express.Router();

// Importar rotas diretamente sem transformação
const authRoutes = require('./authRoutes');
const clienteRoutes = require('./clienteRoutes');
const reservaRoutes = require('./reservaRoutes');
const quartoRoutes = require('./quartoRoutes');

// Rotas públicas - SEM NENHUMA TRANSFORMAÇÃO
router.use('/auth', authRoutes);
router.use('/clientes', clienteRoutes);
router.use('/quartos', quartoRoutes);
router.use('/reservas', reservaRoutes);

// Rota de health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
