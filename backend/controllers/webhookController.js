// backend/controllers/webhookController.js
const pool = require('../config/database');
const { cancelPaymentTimeout } = require('../utils/paymentTimeout');

class WebhookController {
    async confirmarPagamento(req, res) {
        try {
            console.log('🔔 Webhook recebido:', JSON.stringify(req.body, null, 2));
            
            const { TransactionID, TransactionStatus, Amount, ThirdPartyReference } = req.body;
            
            // Extrair reservaId do ThirdPartyReference
            const match = ThirdPartyReference?.match(/HOTEL_(\d+)_/);
            const reservaId = match ? parseInt(match[1]) : null;
            
            if (!reservaId) {
                console.log('⚠️ Não foi possível extrair reservaId do webhook');
                return res.status(200).json({ success: true, message: 'Webhook recebido' });
            }
            
            // Cancelar timeout
            cancelPaymentTimeout(reservaId);
            
            if (TransactionStatus === 'SUCCESS') {
                // Pagamento confirmado
                await pool.query(
                    `UPDATE reservations 
                     SET payment_status = 'paid',
                         payment_confirmed_at = NOW(),
                         status = 'confirmed',
                         payment_details = $2::jsonb
                     WHERE id = $1`,
                    [reservaId, JSON.stringify({
                        transactionId: TransactionID,
                        amount: Amount,
                        confirmedAt: new Date().toISOString()
                    })]
                );
                
                console.log(`✅ Reserva ${reservaId} confirmada com sucesso!`);
                
            } else if (TransactionStatus === 'FAILED') {
                // Pagamento falhou
                await pool.query(
                    `UPDATE reservations 
                     SET payment_status = 'failed',
                         payment_failed_at = NOW(),
                         status = 'cancelled'
                     WHERE id = $1`,
                    [reservaId]
                );
                
                // Liberar quarto
                const reserva = await pool.query(
                    `SELECT room_id FROM reservations WHERE id = $1`,
                    [reservaId]
                );
                
                if (reserva.rows.length > 0 && reserva.rows[0].room_id) {
                    await pool.query(
                        `UPDATE rooms 
                         SET status = 'available', updated_at = NOW()
                         WHERE id = $1`,
                        [reserva.rows[0].room_id]
                    );
                }
                
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
            
            const webhookData = {
                TransactionID: `SIM_${Date.now()}`,
                TransactionStatus: status,
                Amount: valor,
                CustomerMSISDN: `258${telefone}`,
                TransactionReference: `REF_${reservaId}`,
                ThirdPartyReference: `HOTEL_${reservaId}_${Date.now()}`
            };
            
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
