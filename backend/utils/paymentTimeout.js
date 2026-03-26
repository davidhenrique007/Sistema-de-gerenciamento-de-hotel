// backend/utils/paymentTimeout.js
const pool = require('../config/database');

const activeTimeouts = new Map();

function startPaymentTimeout(reservaId, transactionId) {
    if (activeTimeouts.has(reservaId)) {
        clearTimeout(activeTimeouts.get(reservaId));
    }
    
    console.log(`⏰ Iniciando timeout de 2 minutos para reserva ${reservaId}`);
    
    const timeout = setTimeout(async () => {
        await handlePaymentTimeout(reservaId, transactionId);
    }, 120000); // 2 minutos
    
    activeTimeouts.set(reservaId, timeout);
}

function cancelPaymentTimeout(reservaId) {
    if (activeTimeouts.has(reservaId)) {
        clearTimeout(activeTimeouts.get(reservaId));
        activeTimeouts.delete(reservaId);
        console.log(`⏰ Timeout cancelado para reserva ${reservaId}`);
    }
}

async function handlePaymentTimeout(reservaId, transactionId) {
    try {
        console.log(`⏰ Timeout atingido para reserva ${reservaId}`);
        
        const reserva = await pool.query(
            `SELECT id, payment_status, room_id 
             FROM reservations 
             WHERE id = $1`,
            [reservaId]
        );
        
        if (reserva.rows.length === 0) return;
        
        const { payment_status, room_id } = reserva.rows[0];
        
        if (payment_status === 'pending') {
            await pool.query(
                `UPDATE reservations 
                 SET payment_status = 'expired',
                     payment_expired_at = NOW(),
                     status = 'expired'
                 WHERE id = $1`,
                [reservaId]
            );
            
            if (room_id) {
                await pool.query(
                    `UPDATE rooms 
                     SET status = 'available', updated_at = NOW()
                     WHERE id = $1`,
                    [room_id]
                );
                console.log(`🔓 Quarto ${room_id} liberado (timeout)`);
            }
            
            console.log(`✅ Reserva ${reservaId} expirada por timeout`);
        }
        
    } catch (error) {
        console.error(`❌ Erro no timeout da reserva ${reservaId}:`, error);
    } finally {
        activeTimeouts.delete(reservaId);
    }
}

module.exports = {
    startPaymentTimeout,
    cancelPaymentTimeout,
    handlePaymentTimeout
};
