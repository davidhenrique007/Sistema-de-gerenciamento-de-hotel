// frontend/src/features/home/hooks/useMpesaPayment.js
import { useState, useCallback } from 'react';
import api from '../../../services/api';

export const useMpesaPayment = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);
    const [transactionId, setTransactionId] = useState(null);

    const iniciarPagamento = useCallback(async (reservaId, telefone, valor) => {
        setLoading(true);
        setError(null);
        setStatus('initiating');
        
        try {
            const response = await api.post('/pagamentos/mpesa/iniciar', {
                reservaId,
                telefone,
                valor
            });
            
            if (response.data.success) {
                setTransactionId(response.data.transactionId);
                setStatus('pending');
                
                // Confirmar pagamento IMEDIATAMENTE após 1 segundo
                setTimeout(async () => {
                    try {
                        // Chamar o webhook de simulação
                        await api.post('/webhooks/simular', {
                            reservaId: response.data.reservaId,
                            status: 'SUCCESS',
                            valor: valor,
                            telefone: telefone
                        });
                        setStatus('success');
                        console.log('✅ Pagamento confirmado!');
                    } catch (err) {
                        console.error('❌ Erro ao confirmar pagamento:', err);
                        setStatus('failed');
                    }
                }, 1000);
                
                return {
                    success: true,
                    transactionId: response.data.transactionId,
                    message: response.data.message,
                    reservaId: response.data.reservaId
                };
            }
            
            setStatus('failed');
            setError(response.data.message);
            return { success: false, message: response.data.message };
            
        } catch (err) {
            console.error('❌ Erro ao iniciar pagamento:', err);
            const errorMsg = err.response?.data?.message || 'Erro ao processar pagamento. Tente novamente.';
            setError(errorMsg);
            setStatus('failed');
            return { success: false, message: errorMsg };
        } finally {
            setLoading(false);
        }
    }, []);

    const consultarStatus = useCallback(async (reservaId) => {
        try {
            const response = await api.get(`/pagamentos/${reservaId}/status`);
            setStatus(response.data.status);
            return response.data;
        } catch (err) {
            console.error('❌ Erro ao consultar status:', err);
            return null;
        }
    }, []);

    const aguardarConfirmacao = useCallback(async (reservaId, intervalo = 1000, timeout = 5000) => {
        const startTime = Date.now();
        
        const checkStatus = async () => {
            const result = await consultarStatus(reservaId);
            
            if (result?.status === 'paid' || result?.status === 'success') {
                setStatus('success');
                return { success: true, status: 'paid' };
            }
            
            if (result?.status === 'failed' || result?.status === 'cancelled') {
                setStatus('failed');
                return { success: false, status: result.status };
            }
            
            if (Date.now() - startTime > timeout) {
                setStatus('timeout');
                return { success: false, status: 'timeout' };
            }
            
            await new Promise(resolve => setTimeout(resolve, intervalo));
            return checkStatus();
        };
        
        return checkStatus();
    }, [consultarStatus]);

    const reset = useCallback(() => {
        setLoading(false);
        setStatus(null);
        setError(null);
        setTransactionId(null);
    }, []);

    return {
        loading,
        status,
        error,
        transactionId,
        iniciarPagamento,
        consultarStatus,
        aguardarConfirmacao,
        reset,
        isPending: status === 'pending',
        isSuccess: status === 'success',
        isFailed: status === 'failed',
        isLoading: loading
    };
};

export default useMpesaPayment;
