import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../../../../services/api';
import styles from '../styles/Checkout.module.css';

const cardElementOptions = {
    style: {
        base: {
            fontSize: '16px',
            color: '#424770',
            fontFamily: '"Open Sans", sans-serif',
            '::placeholder': { color: '#aab7c4' },
        },
        invalid: { color: '#9e2146' },
    },
    hidePostalCode: true,
};

const StripeElements = ({ reservaId, valor, onSuccess, onError, onPending }) => {
    const [clientSecret, setClientSecret] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [paymentIntentId, setPaymentIntentId] = useState(null);

    const stripe = useStripe();
    const elements = useElements();

    // Criar PaymentIntent apenas uma vez
    useEffect(() => {
        const createPaymentIntent = async () => {
            if (!reservaId || !valor) return;
            if (clientSecret) return; // Já tem clientSecret
            
            setLoading(true);
            try {
                console.log('💰 Stripe: Criando PaymentIntent para reserva', reservaId);
                const response = await api.post('/stripe/create-intent', {
                    reservaId,
                    valor,
                    descricao: `Reserva Hotel Paradise - ${reservaId}`
                });

                if (response.data.success) {
                    setClientSecret(response.data.clientSecret);
                    setPaymentIntentId(response.data.paymentIntentId);
                    console.log('✅ Stripe: PaymentIntent criado:', response.data.paymentIntentId);
                    onPending?.(response.data);
                } else {
                    setError(response.data.message);
                    onError?.(response.data);
                }
            } catch (err) {
                console.error('❌ Stripe: Erro:', err);
                setError(err.response?.data?.message || 'Erro ao iniciar pagamento');
                onError?.({ message: err.response?.data?.message });
            } finally {
                setLoading(false);
            }
        };

        createPaymentIntent();
    }, [reservaId, valor]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!clientSecret) {
            setError('Pagamento não inicializado. Tente novamente.');
            return;
        }
        
        if (!stripe || !elements) {
            setError('Stripe não carregado.');
            return;
        }

        setLoading(true);
        setError(null);

        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
            setError('Erro ao carregar formulário.');
            setLoading(false);
            return;
        }

        try {
            console.log('💳 Confirmando pagamento com ID:', paymentIntentId);
            
            const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                }
            });

            if (confirmError) {
                console.error('❌ Erro:', confirmError);
                setError(confirmError.message);
                onError?.({ message: confirmError.message });
                setPaymentStatus('failed');
            } else if (paymentIntent.status === 'succeeded') {
                console.log('✅ Pagamento confirmado!');
                setPaymentStatus('succeeded');
                onSuccess?.({
                    paymentIntentId: paymentIntent.id,
                    status: paymentIntent.status
                });
            }
        } catch (err) {
            console.error('❌ Erro:', err);
            setError(err.message);
            onError?.({ message: err.message });
            setPaymentStatus('failed');
        } finally {
            setLoading(false);
        }
    };

    const testCards = [
        { number: '4242 4242 4242 4242', description: 'Sucesso', color: '#28a745' },
        { number: '4000 0000 0000 0002', description: 'Falha', color: '#dc3545' },
    ];

    return (
        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <span style={{ fontSize: '2rem' }}>💳</span>
                <h3 style={{ margin: 0 }}>Pagamento com Cartão</h3>
            </div>

            {loading && !clientSecret && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid #e9ecef', borderTopColor: '#28a745', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                    <p>Inicializando...</p>
                </div>
            )}

            {clientSecret && (
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Dados do Cartão</label>
                        <div style={{ padding: '12px', border: '1px solid #ced4da', borderRadius: '8px', background: 'white' }}>
                            <CardElement options={cardElementOptions} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px', padding: '12px', background: '#e8f4fd', borderRadius: '8px', textAlign: 'center' }}>
                        <strong>Valor: {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(valor)}</strong>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !stripe}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        {loading ? 'Processando...' : `Pagar ${new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(valor)}`}
                    </button>

                    {error && (
                        <div style={{ color: '#dc3545', marginTop: '10px', textAlign: 'center' }}>
                            ❌ {error}
                        </div>
                    )}
                </form>
            )}

            {paymentStatus === 'succeeded' && (
                <div style={{ color: '#28a745', marginTop: '10px', textAlign: 'center' }}>
                    ✅ Pagamento confirmado!
                </div>
            )}

            <div style={{ marginTop: '20px', padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>🧪 Cartões de Teste</p>
                {testCards.map((card, index) => (
                    <div key={index}>
                        <code>{card.number}</code> - <span style={{ color: card.color }}>{card.description}</span>
                    </div>
                ))}
                <small>CVV qualquer, data futura</small>
            </div>
        </div>
    );
};

export default StripeElements;