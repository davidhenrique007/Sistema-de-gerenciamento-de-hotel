const express = require('express');
const router = express.Router();
const quartoAdminController = require('../../controllers/admin/quartoAdminController');
const { verificarToken, verificarRole } = require('../../middlewares/auth');

router.use(verificarToken);
router.use(verificarRole(['admin']));

router.get('/', quartoAdminController.listar);
router.get('/estatisticas', quartoAdminController.obterEstatisticas);
router.get('/lixeira', quartoAdminController.listarLixeira);
router.get('/:id', quartoAdminController.buscarPorId);
router.put('/:id/status', quartoAdminController.atualizarStatus);
router.delete('/:id', quartoAdminController.excluir);
router.put('/:id/recuperar', quartoAdminController.recuperar);
router.delete('/:id/permanente', quartoAdminController.excluirPermanentemente);

module.exports = router;
