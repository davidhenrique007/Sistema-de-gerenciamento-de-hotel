const express = require('express');
const logController = require('../../controllers/admin/logController');
const { verificarToken } = require('../../middlewares/auth');
const { verificarRole } = require('../../middlewares/auth');

const router = express.Router();

// Apenas admin pode ver logs
router.use(verificarToken);
router.use(verificarRole(['admin']));

router.get('/logs', logController.listar);
router.get('/logs/usuario/:id', logController.listarPorUsuario);

module.exports = router;
