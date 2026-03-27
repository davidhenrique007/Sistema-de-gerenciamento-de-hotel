// backend/services/mpesaService.js
const axios = require('axios');
const crypto = require('crypto');
const mpesaConfig = require('../config/mpesa');

class MpesaService {
    constructor() {
        this.baseURL = mpesaConfig.baseUrl;
        this.apiKey = mpesaConfig.apiKey;
        this.publicKey = mpesaConfig.publicKey;
        this.serviceProviderCode = mpesaConfig.serviceProviderCode;
    }

    /**
     * Gerar assinatura para requisição
     */
    generateSignature(data) {
        const timestamp = new Date().toISOString();
        const stringToSign = `${this.apiKey}${timestamp}${data}`;
        return crypto
            .createHmac('sha256', this.publicKey)
            .update(stringToSign)
            .digest('hex');
    }

    /**
     * Iniciar pagamento M-Pesa
     */
    async iniciarPagamento({ telefone, valor, referencia, reservaId }) {
        try {
            console.log(`💰 Iniciando pagamento M-Pesa para reserva ${reservaId}`);
            
            // Formatar telefone (remover espaços, garantir prefixo 258)
            const telefoneFormatado = this.formatarTelefone(telefone);
            
            // Dados da requisição
            const payload = {
                input_TransactionReference: referencia,
                input_CustomerMSISDN: telefoneFormatado,
                input_Amount: valor,
                input_ServiceProviderCode: this.serviceProviderCode,
                input_ThirdPartyReference: `HOTEL_${reservaId}_${Date.now()}`,
                input_PaymentWebURL: mpesaConfig.webhookUrl
            };

            // Gerar assinatura
            payload.input_Signature = this.generateSignature(JSON.stringify(payload));

            // Log da requisição (sem dados sensíveis)
            console.log(`📤 Enviando requisição M-Pesa para ${telefoneFormatado}, valor: ${valor} MZN`);

            // Enviar para API M-Pesa
            const response = await axios.post(
                `${this.baseURL}/ipg/v1/request`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    timeout: mpesaConfig.webhookTimeout
                }
            );

            // Processar resposta
            if (response.data && response.data.output_ResponseCode === 'INS-0') {
                console.log(`✅ Pagamento iniciado: ${response.data.output_TransactionID}`);
                return {
                    success: true,
                    transactionId: response.data.output_TransactionID,
                    status: 'pending',
                    message: 'Pagamento iniciado. Aguarde confirmação no seu telefone.'
                };
            } else {
                throw new Error(response.data?.output_ResponseDesc || 'Erro ao iniciar pagamento');
            }

        } catch (error) {
            console.error('❌ Erro ao iniciar pagamento M-Pesa:', error.message);
            
            // Tratamento de erros específicos
            if (error.code === 'ECONNABORTED') {
                return {
                    success: false,
                    status: 'timeout',
                    message: 'Tempo limite excedido. Tente novamente.'
                };
            }
            
            if (error.response?.status === 401) {
                return {
                    success: false,
                    status: 'auth_error',
                    message: 'Erro de autenticação. Contate o suporte.'
                };
            }
            
            return {
                success: false,
                status: 'error',
                message: error.message || 'Erro ao processar pagamento'
            };
        }
    }

    /**
     * Confirmar pagamento via webhook
     */
    async confirmarPagamento(webhookData) {
        try {
            console.log(`🔔 Recebendo webhook M-Pesa: ${webhookData.TransactionID}`);
            
            // Validar assinatura do webhook
            if (mpesaConfig.validateWebhookSignature) {
                const isValid = this.validateWebhookSignature(webhookData);
                if (!isValid) {
                    throw new Error('Assinatura inválida');
                }
            }
            
            // Extrair dados
            const { 
                TransactionID, 
                TransactionStatus, 
                Amount, 
                CustomerMSISDN,
                TransactionReference,
                ThirdPartyReference 
            } = webhookData;
            
            // Extrair reservaId do ThirdPartyReference
            const reservaId = this.extractReservaId(ThirdPartyReference);
            
            // Determinar status da reserva
            const statusPagamento = this.mapMpesaStatus(TransactionStatus);
            
            console.log(`📊 Status M-Pesa: ${TransactionStatus} -> ${statusPagamento}`);
            
            return {
                success: statusPagamento === 'success',
                reservaId,
                transactionId: TransactionID,
                status: statusPagamento,
                valor: Amount,
                telefone: CustomerMSISDN,
                referencia: TransactionReference,
                data: webhookData
            };
            
        } catch (error) {
            console.error('❌ Erro ao confirmar pagamento:', error.message);
            throw error;
        }
    }

    /**
     * Reverter/Estornar pagamento
     */
    async reverterPagamento(transactionId, motivo = 'Cancelamento') {
        try {
            console.log(`🔄 Revertendo pagamento: ${transactionId}`);
            
            const payload = {
                input_TransactionID: transactionId,
                input_ServiceProviderCode: this.serviceProviderCode,
                input_Reason: motivo
            };
            
            const response = await axios.post(
                `${this.baseURL}/ipg/v1/reversal`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    }
                }
            );
            
            if (response.data?.output_ResponseCode === 'INS-0') {
                console.log(`✅ Pagamento revertido: ${transactionId}`);
                return { success: true, message: 'Pagamento revertido com sucesso' };
            }
            
            return { success: false, message: 'Erro ao reverter pagamento' };
            
        } catch (error) {
            console.error(`❌ Erro ao reverter pagamento ${transactionId}:`, error.message);
            return { success: false, message: error.message };
        }
    }

    /**
     * Consultar status do pagamento
     */
    async consultarPagamento(transactionId) {
        try {
            const response = await axios.get(
                `${this.baseURL}/ipg/v1/transaction/${transactionId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`
                    }
                }
            );
            
            return {
                success: true,
                status: response.data.TransactionStatus,
                data: response.data
            };
        } catch (error) {
            console.error(`❌ Erro ao consultar pagamento ${transactionId}:`, error.message);
            return { success: false, message: error.message };
        }
    }

    /**
     * Formatar telefone para padrão M-Pesa (25884xxxxxx)
     */
    formatarTelefone(telefone) {
        let numero = telefone.replace(/\D/g, '');
        
        // Remover prefixo 258 se já tiver
        if (numero.startsWith('258')) {
            numero = numero.substring(3);
        }
        
        // Remover o 0 inicial se tiver
        if (numero.startsWith('0')) {
            numero = numero.substring(1);
        }
        
        // Adicionar prefixo 258
        return `258${numero}`;
    }

    /**
     * Validar assinatura do webhook
     */
    validateWebhookSignature(data) {
        // Implementar validação conforme documentação M-Pesa
        // Normalmente verifica se a assinatura recebida corresponde à gerada
        const expectedSignature = this.generateSignature(JSON.stringify(data));
        return data.input_Signature === expectedSignature;
    }

    /**
     * Extrair ID da reserva do ThirdPartyReference
     */
    extractReservaId(thirdPartyReference) {
        const match = thirdPartyReference.match(/HOTEL_(\d+)_/);
        return match ? parseInt(match[1]) : null;
    }

    /**
     * Mapear status M-Pesa para status interno
     */
    mapMpesaStatus(mpesaStatus) {
        const statusMap = {
            'SUCCESS': 'success',
            'FAILED': 'failed',
            'PENDING': 'pending',
            'CANCELLED': 'cancelled',
            'REVERSED': 'reversed'
        };
        return statusMap[mpesaStatus] || 'unknown';
    }
}

module.exports = new MpesaService();