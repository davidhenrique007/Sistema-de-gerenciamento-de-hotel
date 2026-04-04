const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Buscar reserva por ID ou código
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            `SELECT r.*, 
                    g.name as guest_name, 
                    g.email as guest_email, 
                    g.phone as guest_phone,
                    rm.room_number, 
                    rm.type as room_type,
                    rm.price_per_night
             FROM reservations r
             JOIN guests g ON r.guest_id = g.id
             JOIN rooms rm ON r.room_id = rm.id
             WHERE r.reservation_code = $1 OR r.id::text = $1`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Reserva não encontrada' 
            });
        }
        
        // Buscar serviços da reserva
        const servicos = await pool.query(
            `SELECT service_name, service_type, price_per_unit, nights, total_price
             FROM reservation_services
             WHERE reservation_id = $1`,
            [result.rows[0].id]
        );
        
        const reservaData = result.rows[0];
        reservaData.servicos = servicos.rows;
        
        res.json({ 
            success: true, 
            data: reservaData 
        });
    } catch (error) {
        console.error('Erro ao buscar reserva para recibo:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao carregar recibo' 
        });
    }
});

module.exports = router;
