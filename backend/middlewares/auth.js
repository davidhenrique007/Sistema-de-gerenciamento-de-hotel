const { models } = require('../models');

const authMiddleware = async (req, res, next) => {
    // Para desenvolvimento, vamos permitir acesso sem autenticação
    if (process.env.NODE_ENV === 'development') {
        req.user = {
            id: '29ee2d94-1cbd-4d85-acb7-ad24819011f2',
            email: 'admin@hotelparadise.com',
            role: 'admin'
        };
        return next();
    }
    
    // Validação real do token
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({
            error: true,
            message: 'Token de autenticação não fornecido'
        });
    }
    
    try {
        // Aqui você pode verificar o token JWT
        // Por enquanto, apenas desenvolvimento
        req.user = {
            id: '29ee2d94-1cbd-4d85-acb7-ad24819011f2',
            email: 'admin@hotelparadise.com',
            role: 'admin'
        };
        next();
    } catch (error) {
        return res.status(401).json({
            error: true,
            message: 'Token inválido ou expirado'
        });
    }
};

module.exports = authMiddleware;
