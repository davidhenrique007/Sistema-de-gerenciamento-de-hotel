// backend/controllers/pagamentoController.js
const mpesaService = require('../services/mpesaService');
const pool = require('../config/database');
const { startPaymentTimeout } = require('../utils/paymentTimeout');

class PagamentoController {
    async iniciarPagamentoMpesa(req, res) {
        const { reservaId, telefone, valor } = req.body;
        
        try {
            console.log(`💰 Iniciando pagamento para reserva ${reservaId}`);
            
            // Verificar se reserva existe
            const reserva = await pool.query(
                `SELECT id, status, valor_total, payment_status 
                 FROM reservations 
                 WHERE id = $1`,
                [reservaId]
            );
            
            if (reserva.rows.length === 0) {
                return res.status(404).json({
                    error: true,
                    message: 'Reserva não encontrada'
                });
            }
            
            const reservaData = reserva.rows[0];
            
            if (reservaData.payment_status === 'paid') {
                return res.status(400).json({
                    error: true,
                    message: 'Pagamento já foi realizado'
                });
            }
            
            // Gerar referência única
            const referencia = `RES${reservaId}_${Date.now()}`;
            
            // Iniciar pagamento (simulado para desenvolvimento)
            const pagamento = {
                success: true,
                transactionId: `SIM_${Date.now()}`,
                status: 'pending',
                message: 'Pagamento iniciado. Aguarde confirmação.'
            };
            
            // Atualizar status da reserva
            await pool.query(
                `UPDATE reservations 
                 SET payment_status = 'pending',
                     payment_transaction_id = $2,
                     payment_reference = $3,
                     payment_initiated_at = NOW()
                 WHERE id = $1`,
                [reservaId, pagamento.transactionId, referencia]
            );
            
            // Iniciar timeout para cancelar pagamento pendente
            startPaymentTimeout(reservaId, pagamento.transactionId);
            
            return res.status(200).json({
                success: true,
                transactionId: pagamento.transactionId,
                status: pagamento.status,
                message: pagamento.message
            });
            
        } catch (error) {
            console.error('❌ Erro ao iniciar pagamento:', error);
            return res.status(500).json({
                error: true,
                message: 'Erro ao processar pagamento',
                details: error.message
            });
        }
    }
    
    async consultarPagamento(req, res) {
        const { reservaId } = req.params;
        
        try {
            const reserva = await pool.query(
                `SELECT payment_status, payment_transaction_id, status 
                 FROM reservations 
                 WHERE id = $1`,
                [reservaId]
            );
            
            if (reserva.rows.length === 0) {
                return res.status(404).json({
                    error: true,
                    message: 'Reserva não encontrada'
                });
            }
            
            const { payment_status } = reserva.rows[0];
            
            return res.json({
                success: true,
                status: payment_status,
                message: this.getStatusMessage(payment_status)
            });
            
        } catch (error) {
            console.error('❌ Erro ao consultar pagamento:', error);
            return res.status(500).json({
                error: true,
                message: 'Erro ao consultar pagamento'
            });
        }
    }
    
    getStatusMessage(status) {
        const messages = {
            'pending': 'pendente de confirmação',
            'paid': 'confirmado',
            'failed': 'falhou',
            'cancelled': 'cancelado',
            'expired': 'expirado'
        };
        return messages[status] || status;
    }
}

module.exports = new PagamentoController();
