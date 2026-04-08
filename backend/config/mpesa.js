// backend/config/mpesa.js
require('dotenv').config();

const mpesaConfig = {
    // Credenciais da API
    apiKey: process.env.MPESA_API_KEY,
    publicKey: process.env.MPESA_PUBLIC_KEY,
    serviceProviderCode: process.env.MPESA_SERVICE_PROVIDER_CODE,
    
    // URLs
    baseUrl: process.env.MPESA_BASE_URL || 'https://sandbox.api.mpesa.com',
    apiVersion: 'v1',
    
    // Timeouts
    paymentTimeout: parseInt(process.env.MPESA_PAYMENT_TIMEOUT) || 120000, // 2 minutos
    webhookTimeout: parseInt(process.env.MPESA_WEBHOOK_TIMEOUT) || 30000,
    
    // Callbacks
    webhookUrl: process.env.MPESA_WEBHOOK_URL || 'https://your-domain.com/api/pagamentos/mpesa/confirmar',
    
    // Ambiente
    environment: process.env.NODE_ENV || 'development',
    
    // Configurações de segurança
    validateWebhookSignature: process.env.MPESA_VALIDATE_SIGNATURE === 'true',
    
    // IDs de teste
    testPhoneNumber: process.env.MPESA_TEST_PHONE || '841234567'
};

// Validação de configuração
const requiredFields = ['apiKey', 'publicKey', 'serviceProviderCode'];
const missingFields = requiredFields.filter(field => !mpesaConfig[field]);

if (missingFields.length > 0 && mpesaConfig.environment === 'production') {
    console.error('❌ Configuração M-Pesa incompleta:', missingFields);
    process.exit(1);
}

module.exports = mpesaConfig;