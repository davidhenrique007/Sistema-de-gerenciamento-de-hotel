// backend/routes/admin/utilizadorRoutes.js
const express = require('express');
const utilizadorController = require('../../controllers/admin/utilizadorController');
const { verificarToken } = require('../../middlewares/auth');
const { verificarAcessoUtilizadores, verificarNaoAutoDesativacao } = require('../../middlewares/permissaoMiddleware');

const router = express.Router();

router.use(verificarToken);
router.use(verificarAcessoUtilizadores);

router.get('/utilizadores', utilizadorController.listar);
router.get('/utilizadores/:id', utilizadorController.obter);
router.post('/utilizadores', utilizadorController.criar);
router.put('/utilizadores/:id', verificarNaoAutoDesativacao, utilizadorController.atualizar);
router.post('/utilizadores/:id/reset-senha', utilizadorController.resetarSenha);

module.exports = router;