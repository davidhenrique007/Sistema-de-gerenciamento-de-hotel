// backend/routes/users.routes.js
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const authMiddleware = require('../middlewares/auth');

// Função authorize simplificada
const authorize = (roles = []) => {
    return async (req, res, next) => {
        // Para desenvolvimento, permitir acesso
        if (process.env.NODE_ENV === 'development') {
            return next();
        }
        
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ error: true, message: 'Não autorizado' });
            }
            
            // Verificar token
            // Por enquanto, apenas permitir
            next();
        } catch (error) {
            return res.status(401).json({ error: true, message: 'Token inválido' });
        }
    };
};

// Rotas
router.get('/', authorize('admin'), usersController.findAll);
router.get('/:id', authorize(), usersController.findById);
router.post('/', authorize('admin'), usersController.create);
router.put('/:id', authorize('admin'), usersController.update);
router.delete('/:id', authorize('admin'), usersController.delete);

module.exports = router;