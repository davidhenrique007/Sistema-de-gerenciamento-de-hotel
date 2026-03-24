// =====================================================
// HOTEL PARADISE - USERS ROUTES
// Versão: 1.0.0
// =====================================================

const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { authorize } = require('../middlewares/auth');

// =====================================================
// ROTAS PROTEGIDAS POR PERFIL
// =====================================================

// Listar usuários (apenas admin)
router.get('/', authorize('admin'), usersController.findAll);

// Buscar usuário por ID (admin ou próprio usuário)
router.get('/:id', usersController.findById);

// Criar usuário (apenas admin)
router.post('/', authorize('admin'), usersController.create);

// Atualizar usuário (admin ou próprio usuário)
router.put('/:id', usersController.update);

// Deletar usuário (apenas admin)
router.delete('/:id', authorize('admin'), usersController.delete);

// Ativar/Desativar usuário (apenas admin)
router.patch('/:id/toggle-active', authorize('admin'), usersController.toggleActive);

module.exports = router;