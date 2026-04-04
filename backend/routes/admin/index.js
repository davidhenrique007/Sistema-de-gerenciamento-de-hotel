const express = require('express');
const router = express.Router();

// Importar rotas específicas do admin
const dashboardRoutes = require('./dashboardRoutes');

// Registrar rotas
router.use('/dashboard', dashboardRoutes);

module.exports = router;
