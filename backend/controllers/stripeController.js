// backend/controllers/stripeController.js
const stripeService = require('../services/stripeService');
const pool = require('../config/database');

class StripeController {
    async createPaymentIntent(req, res) {
        const { reservaId, valor, descricao } = req.body;

        try {
            console.log('📝 Stripe: Criando PaymentIntent para reserva', reservaId, 'valor:', valor);

            // Criar PaymentIntent
            const result = await stripeService.createPaymentIntent({
                reservaId,
                valor,
                descricao: descricao || `Reserva Hotel Paradise - ${reservaId}`,
                metadata: {
                    reservaId,
                    user_id: req.user?.id || 'guest'
                }
            });

            if (!result.success) {
                return res.status(400).json({
                    error: true,
                    message: result.error,
                    code: result.code
                });
            }

            // Atualizar status da reserva (opcional, se a reserva existir)
            try {
                await pool.query(
                    `UPDATE reservations 
                     SET payment_status = 'pending',
                         payment_reference = $2,
                         payment_initiated_at = NOW()
                     WHERE id = $1`,
                    [reservaId, result.paymentIntentId]
                );
                console.log('✅ Reserva atualizada com status pending');
            } catch (dbError) {
                console.log('⚠️ Reserva não encontrada no banco (usando ID temporário)');
            }

            return res.json({
                success: true,
                clientSecret: result.clientSecret,
                paymentIntentId: result.paymentIntentId,
                message: 'Pagamento iniciado'
            });

        } catch (error) {
            console.error('❌ Erro ao criar PaymentIntent:', error);
            return res.status(500).json({
                error: true,
                message: 'Erro ao processar pagamento',
                details: error.message
            });
        }
    }

    async confirmPayment(req, res) {
        const { paymentIntentId } = req.body;

        try {
            const result = await stripeService.confirmPayment(paymentIntentId);

            if (!result.success) {
                return res.status(400).json({
                    error: true,
                    message: result.error
                });
            }

            return res.json({
                success: true,
                status: result.status
            });

        } catch (error) {
            console.error('❌ Erro ao confirmar pagamento:', error);
            return res.status(500).json({
                error: true,
                message: 'Erro ao confirmar pagamento'
            });
        }
    }

    async getPaymentStatus(req, res) {
        const { reservaId } = req.params;

        try {
            const reserva = await pool.query(
                `SELECT payment_status, payment_reference 
                 FROM reservations 
                 WHERE id = $1`,
                [reservaId]
            );

            if (reserva.rows.length === 0) {
                return res.json({
                    success: true,
                    data: {
                        status: 'pending',
                        message: 'Aguardando pagamento'
                    }
                });
            }

            return res.json({
                success: true,
                data: {
                    status: reserva.rows[0].payment_status,
                    referencia: reserva.rows[0].payment_reference
                }
            });

        } catch (error) {
            console.error('❌ Erro ao consultar pagamento:', error);
            return res.status(500).json({
                error: true,
                message: 'Erro ao consultar pagamento'
            });
        }
    }
}

module.exports = new StripeController();
