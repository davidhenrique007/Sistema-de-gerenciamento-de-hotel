// backend/models/Pagamento.js
const pool = require('../config/database');

class Pagamento {
    static async criar({ reservaId, valor, gateway, referencia, status = 'pending', metadata = {} }) {
        const result = await pool.query(
            `INSERT INTO payments (
                reserva_id, valor, gateway, referencia, status, 
                metadata, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            RETURNING *`,
            [reservaId, valor, gateway, referencia, status, JSON.stringify(metadata)]
        );
        return result.rows[0];
    }

    static async atualizarStatus(paymentIntentId, status, dados = {}) {
        const result = await pool.query(
            `UPDATE payments 
             SET status = $2, 
                 confirmed_at = CASE WHEN $2 = 'paid' THEN NOW() ELSE confirmed_at END,
                 metadata = metadata || $3::jsonb,
                 updated_at = NOW()
             WHERE referencia = $1
             RETURNING *`,
            [paymentIntentId, status, JSON.stringify(dados)]
        );
        return result.rows[0];
    }

    static async buscarPorReserva(reservaId) {
        const result = await pool.query(
            `SELECT * FROM payments WHERE reserva_id = $1 ORDER BY created_at DESC`,
            [reservaId]
        );
        return result.rows;
    }

    static async buscarPorReferencia(referencia) {
        const result = await pool.query(
            `SELECT * FROM payments WHERE referencia = $1`,
            [referencia]
        );
        return result.rows[0];
    }
}

module.exports = Pagamento;