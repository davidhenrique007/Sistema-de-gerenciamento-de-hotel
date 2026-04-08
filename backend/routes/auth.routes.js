// backend/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({
                error: true,
                message: 'Email ou senha inválidos'
            });
        }
        
        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({
                error: true,
                message: 'Email ou senha inválidos'
            });
        }
        
        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
        
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            error: true,
            message: 'Erro ao realizar login'
        });
    }
});

// Registrar
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        const existente = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );
        
        if (existente.rows.length > 0) {
            return res.status(409).json({
                error: true,
                message: 'Email já cadastrado'
            });
        }
        
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, role, is_active, created_at)
             VALUES ($1, $2, $3, $4, true, NOW())
             RETURNING id, name, email, role`,
            [name, email, password_hash, role || 'client']
        );
        
        res.status(201).json({
            success: true,
            message: 'Usuário criado com sucesso',
            data: result.rows[0]
        });
        
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({
            error: true,
            message: 'Erro ao criar usuário'
        });
    }
});

module.exports = router;