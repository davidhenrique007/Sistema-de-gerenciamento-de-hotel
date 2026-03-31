import React, { useState } from 'react';
import api from '@/services/api';
import styles from '../styles/Checkout.module.css';

const PagamentoMpesa = ({ reservaId, valor, dadosReserva, onSuccess, onError, onPending }) => {
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
            alert('Por favor, insira um número de telefone válido (9 dígitos)');
            return;
        }

        setConfirmando(true);
        setStatus('processando');
        setMensagem('Iniciando pagamento...');

        try {
            // ── PASSO 1: Criar reserva real no banco ──────────────────────────
            let codigoReserva = reservaId;

            if (dadosReserva) {
                setMensagem('Criando reserva...');
                const respostaReserva = await api.post('/reservas', {
                    ...dadosReserva,
                    payment_method: 'mpesa'
                });

                if (!respostaReserva.data.success) {
                    throw new Error(respostaReserva.data.message || 'Erro ao criar reserva');
                }

                // Usar SEMPRE o código vindo do banco
                codigoReserva = respostaReserva.data.data.reservation_code;
                console.log('✅ Reserva criada no banco:', codigoReserva);
            }

            // ── PASSO 2: Simular processamento M-Pesa ─────────────────────────
            setMensagem('Processando pagamento M-Pesa...');
            await new Promise(resolve => setTimeout(resolve, 1500));

            // ── PASSO 3: Confirmar pagamento no banco ─────────────────────────
            setMensagem('Confirmando pagamento...');

            const confirmacao = await api.put(`/reservas/${codigoReserva}/confirmar-pagamento`, {
                payment_method: 'mpesa',
                valor: valor
            });

            if (!confirmacao.data.success) {
                throw new Error(confirmacao.data.message || 'Falha na confirmação do pagamento');
            }

            console.log('✅ Pagamento confirmado para reserva:', codigoReserva);

            // ── PASSO 4: Guardar APENAS o código da reserva no localStorage ───
            // O PDF vai buscar os dados reais directamente do banco usando este código.
            // NUNCA guardar valores calculados aqui — podem estar desactualizados.
            localStorage.setItem('ultima_reserva', JSON.stringify({
                reservation_code: codigoReserva
            }));

            setStatus('success');
            setMensagem('Pagamento confirmado! Redirecionando...');

            setTimeout(() => {
                onSuccess?.({
                    success: true,
                    reservation_code: codigoReserva
                });
            }, 1000);

        } catch (err) {
            console.error('❌ Erro no pagamento:', err);
            setStatus('failed');
            setMensagem(err.response?.data?.message || err.message || 'Erro ao processar pagamento');
            onError?.({ message: err.response?.data?.message || err.message });
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
                            className={styles.input}
                        />
                        <small className={styles.hint}>
                            Digite o seu número de telefone (ex: 84 123 4567)
                        </small>
                    </div>

                    <div className={styles.paymentInfo}>
                        <p>
                            <strong>Valor a pagar:</strong>{' '}
                            {new Intl.NumberFormat('pt-MZ', {
                                style: 'currency',
                                currency: 'MZN'
                            }).format(valor)}
                        </p>
                        <p>
                            <small>
                                Receberá uma notificação no seu telefone para confirmar o pagamento
                            </small>
                        </p>
                    </div>

                    <button type="submit" className={styles.pagarButton}>
                        Pagar{' '}
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
                    <small className={styles.waitingHint}>
                        {status === 'processando' ? 'A processar pagamento...' : ''}
                    </small>

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
                            Tentar Novamente
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default PagamentoMpesa;
