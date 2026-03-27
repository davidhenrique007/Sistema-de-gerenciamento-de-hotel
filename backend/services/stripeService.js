// backend/services/stripeService.js
const { stripe, stripeConfig } = require('../config/stripe');

class StripeService {
    async createPaymentIntent({ reservaId, valor, descricao, metadata = {} }) {
        try {
            console.log(`💰 Criando PaymentIntent para reserva ${reservaId}, valor: ${valor} MZN`);

            const amountInCents = Math.round(valor * 100);

            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountInCents,
                currency: stripeConfig.currency,
                description: descricao || `Reserva Hotel Paradise - ${reservaId}`,
                metadata: {
                    reservaId: reservaId.toString(),
                    ...metadata
                },
                capture_method: 'automatic',
                confirmation_method: 'automatic',
                payment_method_types: ['card'],
            });

            console.log(`✅ PaymentIntent criado: ${paymentIntent.id}`);

            return {
                success: true,
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status
            };

        } catch (error) {
            console.error('❌ Erro ao criar PaymentIntent:', error.message);
            return {
                success: false,
                error: error.message,
                code: error.code,
                type: error.type
            };
        }
    }
}

module.exports = new StripeService();
