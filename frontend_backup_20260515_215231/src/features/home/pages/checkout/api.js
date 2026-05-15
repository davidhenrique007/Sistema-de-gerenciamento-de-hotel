// =====================================================
// HOTEL PARADISE - CHECKOUT API
// Versão: 2.0.0 (Com suporte a i18n)
// =====================================================

import api from '../../../../services/api';

/**
 * Map de erros para chaves i18n
 */
const errorKeyMap = {
    'Pagamento recusado': 'errors.payment_declined',
    'Payment declined': 'errors.payment_declined',
    'Tempo limite excedido': 'errors.payment_timeout',
    'Timeout exceeded': 'errors.payment_timeout',
    'Dados de pagamento inválidos': 'errors.invalid_payment_data',
    'Invalid payment data': 'errors.invalid_payment_data',
    'Erro ao criar reserva': 'errors.booking_creation_failed',
    'Failed to create booking': 'errors.booking_creation_failed',
    'Servidor indisponível': 'errors.server_error',
    'Server unavailable': 'errors.server_error',
    'Erro de conexão': 'errors.network_error',
    'Connection error': 'errors.network_error'
};

/**
 * Converte erro para chave i18n
 */
export const getErrorKey = (errorMessage) => {
    return errorKeyMap[errorMessage] || 'errors.generic';
};

/**
 * Cria uma nova reserva no backend
 */
export const criarReserva = async (dadosReserva, paymentMethod, t) => {
    try {
        const response = await api.post('/reservas', {
            ...dadosReserva,
            payment_method: paymentMethod
        });

        if (!response.data.success) {
            const errorKey = getErrorKey(response.data.message);
            throw new Error(t(errorKey));
        }

        return {
            success: true,
            reservation_code: response.data.data.reservation_code,
            data: response.data.data
        };
    } catch (error) {
        console.error('❌ Erro ao criar reserva:', error);
        
        if (error.response?.data?.message) {
            const errorKey = getErrorKey(error.response.data.message);
            throw new Error(t(errorKey));
        }
        
        throw new Error(t('errors.booking_creation_failed'));
    }
};

/**
 * Confirma o pagamento de uma reserva
 */
export const confirmarPagamento = async (reservationCode, paymentMethod, valor, t) => {
    try {
        const response = await api.put(`/reservas/${reservationCode}/confirmar-pagamento`, {
            payment_method: paymentMethod,
            valor: valor
        });

        if (!response.data.success) {
            const errorKey = getErrorKey(response.data.message);
            throw new Error(t(errorKey));
        }

        return {
            success: true,
            message: t('success.payment_confirmed')
        };
    } catch (error) {
        console.error('❌ Erro ao confirmar pagamento:', error);
        
        if (error.response?.data?.message) {
            const errorKey = getErrorKey(error.response.data.message);
            throw new Error(t(errorKey));
        }
        
        throw new Error(t('errors.payment_declined'));
    }
};

/**
 * Processa pagamento M-Pesa
 */
export const processarPagamentoMpesa = async (reservationCode, telefone, valor, t) => {
    try {
        // Simulação de processamento M-Pesa
        // Em produção, isso seria uma chamada real à API do M-Pesa
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Confirmar pagamento após processamento
        const confirmacao = await confirmarPagamento(reservationCode, 'mpesa', valor, t);

        return {
            success: true,
            reservation_code: reservationCode,
            message: confirmacao.message
        };
    } catch (error) {
        console.error('❌ Erro no pagamento M-Pesa:', error);
        throw error;
    }
};

/**
 * Busca dados de uma reserva pelo código
 */
export const buscarReserva = async (reservationCode, t) => {
    try {
        const response = await api.get(`/reservas/${reservationCode}`);

        if (!response.data.success) {
            throw new Error(t('errors.generic'));
        }

        return {
            success: true,
            data: response.data.data
        };
    } catch (error) {
        console.error('❌ Erro ao buscar reserva:', error);
        throw new Error(t('errors.generic'));
    }
};

export default {
    criarReserva,
    confirmarPagamento,
    processarPagamentoMpesa,
    buscarReserva,
    getErrorKey
};