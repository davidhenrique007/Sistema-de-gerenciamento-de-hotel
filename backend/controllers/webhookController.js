// backend/controllers/webhookController.js
const pool = require('../config/database');
const { cancelPaymentTimeout } = require('../utils/paymentTimeout');

class WebhookController {
    async confirmarPagamento(req, res) {
        try {
            console.log('🔔 Webhook recebido:', JSON.stringify(req.body, null, 2));
            
            const { TransactionID, TransactionStatus, Amount, ThirdPartyReference, reservation_code, reservaId } = req.body;
            
            // Extrair o código da reserva
            let codigoReserva = reservation_code || reservaId;
            
            if (!codigoReserva && ThirdPartyReference) {
                const match = ThirdPartyReference.match(/RES_(\d+)/);
                if (match) codigoReserva = match[1];
            }
            
            if (!codigoReserva) {
                console.log('⚠️ Webhook sem código de reserva');
                return res.status(200).json({ success: true, message: 'Webhook recebido sem código' });
            }
            
            console.log(`📝 Processando webhook para reserva: ${codigoReserva}, status: ${TransactionStatus}`);
            
            cancelPaymentTimeout(codigoReserva);
            
            // Buscar a reserva
            const reserva = await pool.query(
                `SELECT id, status, payment_status FROM reservations WHERE reservation_code = $1 OR id::text = $1`,
                [codigoReserva]
            );
            
            if (reserva.rows.length === 0) {
                console.log(`⚠️ Reserva não encontrada: ${codigoReserva}`);
                return res.status(200).json({ success: true, message: 'Reserva não encontrada' });
            }
            
            const reservaData = reserva.rows[0];
            
            if (TransactionStatus === 'SUCCESS' || TransactionStatus === 'success' || TransactionStatus === 'SUCESSO') {
                await pool.query(`
                    UPDATE reservations 
                    SET payment_status = 'paid',
                        status = 'confirmed',
                        payment_method = 'mpesa',
                        payment_confirmed_at = NOW(),
                        updated_at = NOW()
                    WHERE id = $1
                `, [reservaData.id]);
                
                console.log(`✅ Reserva ${codigoReserva} confirmada com sucesso!`);
                
                return res.status(200).json({
                    success: true,
                    message: 'Pagamento confirmado',
                    reserva: { id: reservaData.id, codigo: codigoReserva, status: 'confirmed' }
                });
            } else {
                await pool.query(`
                    UPDATE reservations 
                    SET payment_status = 'failed',
                        status = 'cancelled',
                        updated_at = NOW()
                    WHERE id = $1
                `, [reservaData.id]);
                
                console.log(`❌ Pagamento da reserva ${codigoReserva} falhou`);
                
                return res.status(200).json({
                    success: false,
                    message: 'Pagamento falhou',
                    reserva: { id: reservaData.id, codigo: codigoReserva, status: 'cancelled' }
                });
            }
            
        } catch (error) {
            console.error('❌ Erro no webhook:', error);
            return res.status(500).json({ success: false, message: 'Erro no processamento', error: error.message });
        }
    }
    
    async simularWebhook(req, res) {
        try {
            const { reservaId, status = 'SUCCESS', valor = 5000, telefone = '841234567' } = req.body;
            
            console.log(`🧪 Simulando webhook para reserva ${reservaId} com status ${status}`);
            
            const webhookData = {
                TransactionID: `SIM_${Date.now()}`,
                TransactionStatus: status,
                Amount: valor,
                CustomerMSISDN: `258${telefone}`,
                TransactionReference: `REF_${reservaId}`,
                ThirdPartyReference: `RES_${reservaId}`,
                reservation_code: reservaId
            };
            
            // Criar um objeto de requisição simulado e chamar confirmarPagamento diretamente
            const mockReq = { body: webhookData };
            const mockRes = {
                status: function(code) { this.statusCode = code; return this; },
                json: function(data) { this.data = data; return this; }
            };
            
            await this.confirmarPagamento(mockReq, mockRes);
            
            return res.json({
                success: true,
                message: `Webhook simulado: ${status}`,
                data: webhookData,
                result: mockRes.data
            });
            
        } catch (error) {
            console.error('❌ Erro ao simular webhook:', error);
            return res.status(500).json({ success: false, message: 'Erro ao simular webhook', error: error.message });
        }
    }
}

module.exports = new WebhookController();
