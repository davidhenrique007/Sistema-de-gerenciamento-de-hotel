// backend/controllers/stripeWebhookController.js
const { stripe, stripeConfig } = require('../config/stripe');
const Pagamento = require('../models/Pagamento');
const pool = require('../config/database');

class StripeWebhookController {
    /**
     * Processar webhook do Stripe
     */
    async handleWebhook(req, res) {
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            // Verificar assinatura do webhook
            event = stripe.webhooks.constructEvent(
                req.rawBody,
                sig,
                stripeConfig.webhookSecret
            );
        } catch (err) {
            console.error(`❌ Erro na assinatura do webhook: ${err.message}`);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        console.log(`🔔 Webhook recebido: ${event.type}`);

        try {
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.handlePaymentSuccess(event.data.object);
                    break;

                case 'payment_intent.payment_failed':
                    await this.handlePaymentFailure(event.data.object);
                    break;

                case 'payment_intent.canceled':
                    await this.handlePaymentCancelled(event.data.object);
                    break;

                default:
                    console.log(`Evento não tratado: ${event.type}`);
            }

            return res.json({ received: true });

        } catch (error) {
            console.error('❌ Erro ao processar webhook:', error);
            return res.status(500).json({ error: 'Webhook processing failed' });
        }
    }

    /**
     * Processar pagamento bem-sucedido
     */
    async handlePaymentSuccess(paymentIntent) {
        const { id, amount, currency, metadata } = paymentIntent;
        const reservaId = parseInt(metadata.reservaId);

        console.log(`✅ Pagamento ${id} confirmado para reserva ${reservaId}`);

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Atualizar pagamento
            await Pagamento.atualizarStatus(id, 'paid', {
                confirmedAt: new Date().toISOString(),
                amount,
                currency
            });

            // Atualizar reserva
            await client.query(
                `UPDATE reservations 
                 SET payment_status = 'paid',
                     payment_confirmed_at = NOW(),
                     status = 'confirmed'
                 WHERE id = $1`,
                [reservaId]
            );

            await client.query('COMMIT');
            console.log(`✅ Reserva ${reservaId} confirmada!`);

        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`❌ Erro ao processar pagamento ${id}:`, error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Processar pagamento falho
     */
    async handlePaymentFailure(paymentIntent) {
        const { id, last_payment_error, metadata } = paymentIntent;
        const reservaId = parseInt(metadata.reservaId);

        console.log(`❌ Pagamento ${id} falhou para reserva ${reservaId}`);

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Atualizar pagamento
            await Pagamento.atualizarStatus(id, 'failed', {
                error: last_payment_error?.message || 'Pagamento recusado',
                errorCode: last_payment_error?.code
            });

            // Atualizar reserva
            await client.query(
                `UPDATE reservations 
                 SET payment_status = 'failed',
                     payment_failed_at = NOW()
                 WHERE id = $1`,
                [reservaId]
            );

            // Liberar quarto se necessário
            const reserva = await client.query(
                `SELECT room_id FROM reservations WHERE id = $1`,
                [reservaId]
            );

            if (reserva.rows.length > 0 && reserva.rows[0].room_id) {
                await client.query(
                    `UPDATE rooms 
                     SET status = 'available', updated_at = NOW()
                     WHERE id = $1`,
                    [reserva.rows[0].room_id]
                );
            }

            await client.query('COMMIT');
            console.log(`✅ Quarto liberado para reserva ${reservaId}`);

        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`❌ Erro ao processar falha ${id}:`, error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Processar pagamento cancelado
     */
    async handlePaymentCancelled(paymentIntent) {
        const { id, metadata } = paymentIntent;
        const reservaId = parseInt(metadata.reservaId);

        console.log(`🔄 Pagamento ${id} cancelado para reserva ${reservaId}`);

        await Pagamento.atualizarStatus(id, 'cancelled', {
            cancelledAt: new Date().toISOString()
        });
    }
}

module.exports = new StripeWebhookController();