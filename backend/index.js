const express = require('express');
const router = express.Router();

// Importar rotas
let authRoutes, clienteRoutes, quartoRoutes, reservaRoutes;

try {
  authRoutes = require('./authRoutes');
} catch (e) {
  console.log('⚠️ authRoutes não encontrado, usando rota padrão');
  authRoutes = express.Router();
  authRoutes.post('/login', (req, res) => {
    res.json({ success: false, message: 'Auth não configurado' });
  });
}

try {
  clienteRoutes = require('./clienteRoutes');
} catch (e) {
  console.log('⚠️ clienteRoutes não encontrado');
  clienteRoutes = express.Router();
}

try {
  quartoRoutes = require('./quartoRoutes');
} catch (e) {
  console.log('⚠️ quartoRoutes não encontrado');
  quartoRoutes = express.Router();
}

try {
  reservaRoutes = require('./reservaRoutes');
} catch (e) {
  console.log('⚠️ reservaRoutes não encontrado');
  reservaRoutes = express.Router();
}

// ROTAS PÚBLICAS
router.use('/auth', authRoutes);
router.use('/clientes', clienteRoutes);
router.use('/quartos', quartoRoutes);
router.use('/reservas', reservaRoutes);

module.exports = router;
