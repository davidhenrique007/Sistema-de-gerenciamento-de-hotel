// backend/services/mpesaService.js
class MpesaService {
    async iniciarPagamento({ telefone, valor, referencia, reservaId }) {
        try {
            console.log(`💰 Iniciando pagamento M-Pesa para reserva ${reservaId}`);
            console.log(`📞 Telefone: ${telefone}, Valor: ${valor} MZN`);

            // Simulação de pagamento bem-sucedido
            const transactionId = `SIM_${Date.now()}`;

            return {
                success: true,
                transactionId: transactionId,
                status: 'pending',
                message: 'Pagamento iniciado. Aguarde confirmação no seu telefone.'
            };

        } catch (error) {
            console.error('❌ Erro M-Pesa:', error);
            return {
                success: false,
                status: 'error',
                message: 'Erro ao processar pagamento'
            };
        }
    }

    async confirmarPagamento(webhookData) {
        console.log('🔔 Webhook M-Pesa recebido:', webhookData);
        return {
            success: true,
            status: 'success',
            reservaId: webhookData.reservaId
        };
    }
}

module.exports = new MpesaService();
