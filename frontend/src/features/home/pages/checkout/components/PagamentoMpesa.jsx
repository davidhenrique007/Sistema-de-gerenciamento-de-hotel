import React, { useState } from 'react';
import useMpesaPayment from '../hooks/useMpesaPayment';
import styles from '../styles/Checkout.module.css';

const PagamentoMpesa = ({ reservaId, valor, onSuccess, onError, onPending }) => {
    const [telefone, setTelefone] = useState('');
    const [confirmando, setConfirmando] = useState(false);
    
    const {
        loading,
        status,
        error,
        transactionId,
        iniciarPagamento,
        aguardarConfirmacao,
        reset
    } = useMpesaPayment();
    
    // Formatar telefone
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
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const numeros = telefone.replace(/\D/g, '');
        if (!telefone || numeros.length < 9) {
            alert('Por favor, insira um número de telefone válido (9 dígitos)');
            return;
        }
        
        const result = await iniciarPagamento(reservaId, numeros, valor);
        
        if (result.success) {
            setConfirmando(true);
            onPending?.(result);
            
            // Iniciar polling para aguardar confirmação
            const confirmacao = await aguardarConfirmacao(reservaId);
            
            if (confirmacao.success) {
                onSuccess?.(result);
            } else {
                onError?.(confirmacao);
            }
        } else {
            onError?.(result);
        }
    };
    
    // Mensagens baseadas no status
    const getMessage = () => {
        if (loading) return '📱 Iniciando pagamento...';
        if (status === 'pending') return '⏳ Aguardando confirmação M-Pesa...\n\nVerifique seu telefone e confirme a transação.';
        if (status === 'success') return '✅ Pagamento confirmado! Redirecionando...';
        if (status === 'failed') return '❌ Pagamento recusado. Verifique seu saldo e tente novamente.';
        if (status === 'timeout') return '⏰ Tempo limite excedido. Tente novamente.';
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
                        Não feche esta página enquanto processamos seu pagamento.
                        O processo pode levar até 2 minutos.
                    </small>
                    
                    {status === 'pending' && (
                        <button
                            onClick={() => window.location.reload()}
                            className={styles.cancelButton}
                        >
                            Cancelar
                        </button>
                    )}
                    
                    {(status === 'failed' || status === 'timeout') && (
                        <button
                            onClick={() => {
                                reset();
                                setConfirmando(false);
                                setTelefone('');
                            }}
                            className={styles.tentarNovamenteButton}
                        >
                            Tentar Novamente
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default PagamentoMpesa;