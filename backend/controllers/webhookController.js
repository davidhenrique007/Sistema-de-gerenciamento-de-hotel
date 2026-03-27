// backend/controllers/webhookController.js
const pool = require('../config/database');
const { cancelPaymentTimeout } = require('../utils/paymentTimeout');

class WebhookController {
    async confirmarPagamento(req, res) {
        try {
            console.log('🔔 Webhook recebido:', JSON.stringify(req.body, null, 2));
            
            const { TransactionID, TransactionStatus, Amount, ThirdPartyReference } = req.body;
            
            // Extrair reservaId do ThirdPartyReference
            let reservaId = null;
            if (ThirdPartyReference) {
                const match = ThirdPartyReference.match(/RES_(\d+)/);
                if (match) reservaId = match[1];
            }
            
            if (!reservaId) {
                console.log('⚠️ Não foi possível extrair reservaId');
                return res.status(200).json({ success: true, message: 'Webhook recebido' });
            }
            
            // Cancelar timeout
            cancelPaymentTimeout(reservaId);
            
            if (TransactionStatus === 'SUCCESS') {
                await pool.query(
                    `UPDATE reservations 
                     SET payment_status = 'paid',
                         status = 'confirmed',
                         updated_at = NOW()
                     WHERE id = $1`,
                    [reservaId]
                );
                console.log(`✅ Reserva ${reservaId} confirmada!`);
            } else if (TransactionStatus === 'FAILED') {
                await pool.query(
                    `UPDATE reservations 
                     SET payment_status = 'failed',
                         status = 'cancelled',
                         updated_at = NOW()
                     WHERE id = $1`,
                    [reservaId]
                );
                console.log(`❌ Pagamento da reserva ${reservaId} falhou`);
            }
            
            return res.status(200).json({
                success: true,
                message: 'Webhook processado com sucesso'
            });
            
        } catch (error) {
            console.error('❌ Erro no webhook:', error);
            return res.status(200).json({
                success: false,
                message: 'Erro processando webhook'
            });
        }
    }
    
    async simularWebhook(req, res) {
        if (process.env.NODE_ENV !== 'production') {
            const { reservaId, status = 'SUCCESS', valor = 5000, telefone = '841234567' } = req.body;
            
            console.log(`🧪 Simulando webhook para reserva ${reservaId} com status ${status}`);
            
            const webhookData = {
                TransactionID: `SIM_${Date.now()}`,
                TransactionStatus: status,
                Amount: valor,
                CustomerMSISDN: `258${telefone}`,
                TransactionReference: `REF_${reservaId}`,
                ThirdPartyReference: `RES_${reservaId}`
            };
            
            // Processar o webhook
            await this.confirmarPagamento({ body: webhookData });
            
            return res.json({
                success: true,
                message: `Webhook simulado: ${status}`,
                data: webhookData
            });
        }
        
        return res.status(403).json({
            error: true,
            message: 'Simulação disponível apenas em desenvolvimento'
        });
    }
}

module.exports = new WebhookController();
