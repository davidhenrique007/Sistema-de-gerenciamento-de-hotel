// backend/routes/quartoRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Rota para listar quartos disponíveis
router.get('/disponiveis', async (req, res) => {
    try {
        const { checkIn, checkOut, tipo } = req.query;
        
        let query = `
            SELECT * FROM rooms 
            WHERE status = 'available'
        `;
        
        const params = [];
        
        if (tipo) {
            query += ` AND type = $${params.length + 1}`;
            params.push(tipo);
        }
        
        query += ` ORDER BY room_number`;
        
        const result = await pool.query(query, params);
        
        res.json({
            success: true,
            data: result.rows,
            total: result.rows.length
        });
    } catch (error) {
        console.error('Erro ao buscar quartos:', error);
        res.status(500).json({
            error: true,
            message: 'Erro ao buscar quartos disponíveis'
        });
    }
});

// Rota para buscar quarto por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM rooms WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: true, message: 'Quarto não encontrado' });
        }
        
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Erro ao buscar quarto:', error);
        res.status(500).json({ error: true, message: 'Erro ao buscar quarto' });
    }
});

module.exports = router;