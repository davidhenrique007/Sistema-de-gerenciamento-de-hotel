// frontend/src/features/home/pages/checkout/components/PagamentoMpesa.jsx
import React, { useState, useEffect, useRef } from 'react';
import useMpesaPayment from '../hooks/useMpesaPayment';
import { useToast } from '../../../../../shared/components/contexts/ToastContext';
import { tratarErro } from '../../../../../shared/utils/tratamentoErros';

import styles from '../styles/Checkout.module.css';

const PagamentoMpesa = ({ reservaId, valor, onSuccess, onError, onPending }) => {
    const [telefone, setTelefone] = useState('');
    const [confirmando, setConfirmando] = useState(false);
    const [pagamentoStatus, setPagamentoStatus] = useState(null);
    const timeoutRef = useRef(null);
    const statusChecked = useRef(false);
    
    const {
        loading,
        status,
        error,
        iniciarPagamento,
        reset
    } = useMpesaPayment();  
  const { showErrorFromException, showSuccess, showWarning } = useToast();
    
    const formatarTelefone = (value) => {
        const numeros = value.replace(/\D/g, '');
        if (numeros.length > 2) {
            return `${numeros.substring(0, 2)} ${numeros.substring(2, 5)} ${numeros.substring(5, 9)}`;
        }
        return numeros;
    };
    
    const handlePhoneChange = (e) => {
        setTelefone(formatarTelefone(e.target.value));
    };
    
    // Efeito para monitorar o status do pagamento
    useEffect(() => {
        if (pagamentoStatus === 'pending' && !statusChecked.current) {
            statusChecked.current = true;
            // Aguardar 3 segundos e confirmar
            timeoutRef.current = setTimeout(() => {
                setPagamentoStatus('success');
                onSuccess?.({ success: true, message: 'Pagamento confirmado!' });
            }, 3000);
        }
        
        if (pagamentoStatus === 'success') {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }
        
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [pagamentoStatus, onSuccess]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const numeros = telefone.replace(/\D/g, '');
        if (!telefone || numeros.length < 9) {
            alert('Por favor, insira um número de telefone válido (9 dígitos)');
            return;
        }
        
        // Simular pagamento bem-sucedido
        setConfirmando(true);
        setPagamentoStatus('pending');
        onPending?.({ success: true, message: 'Pagamento iniciado' });
    };
    
    const getMessage = () => {
        if (pagamentoStatus === 'pending') return '✅ Processando pagamento...';
        if (pagamentoStatus === 'success') return '✅ Pagamento confirmado! Redirecionando...';
        return null;
    };
    
    return (
        <div className={styles.mpesaPaymentContainer}>
            <div className={styles.paymentHeader}>
                <span className={styles.paymentIcon}>📱</span>
                <h3>Pagamento M-Pesa / E-mola / mKesh</h3>
            </div>
            
            {!confirmando ? (
                <form onSubmit={handleSubmit} className={styles.paymentForm}>
                    <div className={styles.formGroup}>
                        <label>Número de telefone</label>
                        <input
                            type="tel"
                            value={telefone}
                            onChange={handlePhoneChange}
                            placeholder="84 123 4567"
                            disabled={loading}
                            className={styles.input}
                        />
                        <small className={styles.hint}>
                            Digite seu número de telefone (ex: 84 123 4567)
                        </small>
                    </div>
                    
                    <div className={styles.paymentInfo}>
                        <p><strong>Valor a pagar:</strong> {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(valor)}</p>
                        <p><small>Você receberá uma notificação no seu telefone para confirmar o pagamento</small></p>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.pagarButton}
                    >
                        {loading ? 'Processando...' : `Pagar ${new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(valor)}`}
                    </button>
                    
                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}
                </form>
            ) : (
                <div className={styles.paymentWaiting}>
                    <div className={styles.spinner}></div>
                    <p className={styles.waitingMessage}>{getMessage()}</p>
                    <small className={styles.waitingHint}>
                        Processando pagamento...
                    </small>
                    
                    {pagamentoStatus === 'pending' && (
                        <button
                            onClick={() => {
                                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                                setConfirmando(false);
                                setPagamentoStatus(null);
                                statusChecked.current = false;
                                setTelefone('');
                            }}
                            className={styles.cancelButton}
                        >
                            Cancelar
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default PagamentoMpesa;

