import React, { useState } from 'react';
import api from '@/services/api';
import styles from '../styles/Checkout.module.css';

const PagamentoMpesa = ({ reservaId, valor, dadosReserva, onSuccess, onError, onPending, t }) => {
    const [telefone, setTelefone] = useState('');
    const [confirmando, setConfirmando] = useState(false);
    const [status, setStatus] = useState(null);
    const [mensagem, setMensagem] = useState('');

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
            alert(t('errors.invalid_phone'));
            return;
        }

        setConfirmando(true);
        setStatus('processando');
        setMensagem(t('payment.processing_payment'));

        try {
            let codigoReserva = reservaId;

            if (dadosReserva) {
                setMensagem(t('common.loading'));
                const respostaReserva = await api.post('/reservas', {
                    ...dadosReserva,
                    payment_method: 'mpesa'
                });

                if (!respostaReserva.data.success) {
                    throw new Error(respostaReserva.data.message || t('errors.booking_creation_failed'));
                }

                codigoReserva = respostaReserva.data.data.reservation_code;
                console.log('✅ Reserva criada no banco:', codigoReserva);
            }

            setMensagem(t('payment.processing_payment'));
            await new Promise(resolve => setTimeout(resolve, 1500));

            setMensagem(t('common.confirm'));
            const confirmacao = await api.put(`/reservas/${codigoReserva}/confirmar-pagamento`, {
                payment_method: 'mpesa',
                valor: valor
            });

            if (!confirmacao.data.success) {
                throw new Error(confirmacao.data.message || t('errors.payment_declined'));
            }

            console.log('✅ Pagamento confirmado para reserva:', codigoReserva);

            localStorage.setItem('ultima_reserva', JSON.stringify({
                reservation_code: codigoReserva
            }));

            setStatus('success');
            setMensagem(t('payment.payment_confirmed'));

            setTimeout(() => {
                onSuccess?.({
                    success: true,
                    reservation_code: codigoReserva
                });
            }, 1000);

        } catch (err) {
            console.error('❌ Erro no pagamento:', err);
            setStatus('failed');
            const errorMsg = err.response?.data?.message || err.message || t('errors.payment_declined');
            setMensagem(errorMsg);
            onError?.({ message: errorMsg });
        }
    };

    const getMensagem = () => {
        if (status === 'processando') return `⏳ ${mensagem}`;
        if (status === 'success')     return `✅ ${mensagem}`;
        if (status === 'failed')      return `❌ ${mensagem}`;
        return null;
    };

    return (
        <div className={styles.mpesaPaymentContainer}>
            <div className={styles.paymentHeader}>
                <span className={styles.paymentIcon}>📱</span>
                <h3>{t('payment.mpesa')}</h3>
            </div>

            {!confirmando ? (
                <form onSubmit={handleSubmit} className={styles.paymentForm}>
                    <div className={styles.formGroup}>
                        <label>{t('payment.phone_number')}</label>
                        <input
                            type="tel"
                            value={telefone}
                            onChange={handlePhoneChange}
                            placeholder={t('payment.phone_placeholder')}
                            className={styles.input}
                        />
                        <small className={styles.hint}>
                            {t('payment.you_will_receive_notification')}
                        </small>
                    </div>

                    <div className={styles.paymentInfo}>
                        <p>
                            <strong>{t('payment.amount_to_pay')}:</strong>{' '}
                            {new Intl.NumberFormat('pt-MZ', {
                                style: 'currency',
                                currency: 'MZN'
                            }).format(valor)}
                        </p>
                    </div>

                    <button type="submit" className={styles.pagarButton}>
                        {t('payment.button')} {' '}
                        {new Intl.NumberFormat('pt-MZ', {
                            style: 'currency',
                            currency: 'MZN'
                        }).format(valor)}
                    </button>
                </form>
            ) : (
                <div className={styles.paymentWaiting}>
                    <div className={styles.spinner}></div>
                    <p className={styles.waitingMessage}>{getMensagem()}</p>

                    {status === 'failed' && (
                        <button
                            onClick={() => {
                                setConfirmando(false);
                                setStatus(null);
                                setMensagem('');
                                setTelefone('');
                            }}
                            className={styles.tentarNovamenteButton}
                        >
                            {t('payment.try_again')}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default PagamentoMpesa;