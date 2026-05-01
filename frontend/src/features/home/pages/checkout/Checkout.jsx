import React
import { useI18n } from '../../../../contexts/I18nContext';, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@contexts/CartContext';
import { useServices } from '@contexts/ServicesContext';
import { useCliente } from '@hooks/useCliente';
import { useModalQuarto } from './hooks/useModalQuarto';
import ResumoReserva from './components/ResumoReserva';
import ModalSelecionarQuarto from './components/room-selection/ModalSelecionarQuarto';
import FormularioDadosPessoais from './components/FormularioDadosPessoais';
import MetodosPagamento from './components/MetodosPagamento';
import BotaoConfirmarPagamento from './components/BotaoConfirmarPagamento';
import ResumoFinal from './components/ResumoFinal';
import ServicosAdicionais from './components/ServicosAdicionais';
import PagamentoMpesa from './components/PagamentoMpesa';
import StripeElements from './components/StripeElements';
import { useValidacaoCheckout } from './hooks/useValidacaoCheckout';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import api from '@services/api';
import styles from './styles/Checkout.module.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Header simples para teste
const HeaderTeste = () => (
    <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        padding: '20px 0',
        marginBottom: '24px',
        color: 'white',
        textAlign: 'center'
    }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '48px' }}>??</div>
                <div>
                    <p style={{ color: '#fbbf24', fontSize: '12px', margin: '0 0 4px 0' }}>HOTEL PARADISE</p>
                    <h1 style={{ fontSize: '28px', margin: 0, background: 'linear-gradient(135deg, #ffffff 0%, #fbbf24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Checkout</h1>
                    <p style={{ fontSize: '12px', opacity: 0.8, margin: '4px 0 0 0' }}>Complete sua reserva com segurança e rapidez</p>
                </div>
            </div>
            <div style={{ marginTop: '16px' }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none', background: 'rgba(255,255,255,0.1)', padding: '8px 20px', borderRadius: '30px', marginRight: '12px' }}>? Voltar</Link>
            </div>
        </div>
    </div>
);

const Checkout = () => {
  const { t } = useI18n();
  () => {
  const navigate = useNavigate();
  const { reservation, room } = useCart();
  const { servicosSelecionados: servicosContexto } = useServices();
  const { cliente, isIdentificado } = useCliente();
  const modalQuarto = useModalQuarto();

  const [guestData, setGuestData] = useState({
    nome: cliente?.name || '',
    telefone: cliente?.phone || '',
    documento: cliente?.document || '',
    email: cliente?.email || '',
  });

  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [taxaImposto] = useState(0.05);
  const [reservaId, setReservaId] = useState(null);
  const [pagamentoStatus, setPagamentoStatus] = useState(null);

  const { errors, isFormValid } = useValidacaoCheckout(guestData, paymentMethod, paymentDetails);

  useEffect(() => {
    if (!reservation && !room) navigate('/');
  }, [reservation, room, navigate]);

  useEffect(() => {
    if (servicosContexto && servicosContexto.length > 0) {
      setServicosSelecionados(servicosContexto);
    }
  }, [servicosContexto]);

  useEffect(() => {
    if (!reservaId && reservation) {
      const tempId = `TEMP_${Date.now()}`;
      setReservaId(tempId);
    }
  }, [reservation, reservaId]);

  useEffect(() => {
    if (modalQuarto.quartosSelecionados.length > 0 && !reservaId) {
      const tempId = `TEMP_${Date.now()}_${modalQuarto.quartosSelecionados[0].numero}`;
      setReservaId(tempId);
    }
  }, [modalQuarto.quartosSelecionados]);

  if (!reservation && !room) return null;

  const tipoQuarto = reservation?.roomType || room?.type || 'Standard';
  const checkIn = reservation?.checkIn || '';
  const Checkout = () => {
  const { t } = useI18n();
  reservation?.checkOut || '';
  const nights = reservation?.nights || 1;
  const pricePerNight = reservation?.pricePerNight || room?.price_per_night || 0;
  const quantidadeQuartos = modalQuarto.quartosSelecionados.length || 1;

  const subtotalQuartos = pricePerNight * nights * quantidadeQuartos;
  const subtotalServicos = servicosSelecionados.reduce((total, servico) => {
    const preco = servico.tipo === 'por_noite' ? servico.preco * nights : servico.preco;
    return total + preco;
  }, 0);
  const subtotal = subtotalQuartos + subtotalServicos;
  const taxas = subtotal * taxaImposto;
  const total = subtotal + taxas;

  const dadosReservaParaBackend = {
    room_ids: modalQuarto.quartosSelecionados.map((q) => q.id),
    check_in: checkIn,
    check_out: checkOut,
    adults_count: reservation?.guests?.adults || 1,
    children_count: reservation?.guests?.children || 0,
    guest_name: guestData.nome,
    guest_phone: guestData.telefone,
    guest_document: guestData.documento,
    guest_email: guestData.email,
    servicos: servicosSelecionados.map((s) => s.id),
  };

  const handlePagamentoConfirmado = (data) => {
    console.log('? Pagamento confirmado!', data);
    setPagamentoStatus('confirmed');

    const codigoReal = data.reservation_code || data.codigo;

    localStorage.setItem('ultima_reserva', JSON.stringify({
      reservation_code: codigoReal
    }));

    navigate('/recibo', {
      state: {
        reservation_code: codigoReal
      },
    });
  };

  const handlePagamentoFalhou = (error) => {
    console.error('? Pagamento falhou:', error);
    setPagamentoStatus('failed');
  };

  const handlePagamentoPendente = (data) => {
    console.log('? Pagamento pendente:', data);
    setPagamentoStatus('pending');
  };

  const handleConfirmPayment = async () => {
    if (!isFormValid) return;
    if (modalQuarto.quartosSelecionados.length === 0) {
      alert('Por favor, selecione pelo menos um quarto');
      return;
    }

    setIsLoading(true);

    try {
      const respostaReserva = await api.post('/reservas', {
        ...dadosReservaParaBackend,
        payment_method: paymentMethod,
      });

      if (!respostaReserva.data.success) {
        throw new Error(respostaReserva.data.message || 'Erro ao criar reserva');
      }

      const { reservation_code } = respostaReserva.data.data;
      console.log('? Reserva criada no banco:', reservation_code);

      await api.put(`/reservas/${reservation_code}/confirmar-pagamento`, {
        payment_method: paymentMethod,
      });

      handlePagamentoConfirmado({ reservation_code });

    } catch (error) {
      console.error('? Erro:', error);
      const mensagem = error.response?.data?.message || 'Erro ao processar. Tente novamente.';
      alert(mensagem);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <HeaderTeste />

      <div className={styles.twoColumns}>
        <div className={styles.columnLeft}>
          <div className={styles.sectionCompact}>
            <h2 className={styles.sectionTitle}>1. Escolha seus quartos</h2>
            {modalQuarto.quartosSelecionados.length > 0 ? (
              <div className={styles.quartosSelecionados}>
                <div className={styles.quartosList}>
                  {modalQuarto.quartosSelecionados.map((quarto) => (
                    <div key={quarto.id} className={styles.quartoSelecionadoItem}>
                      <span>?? Quarto {quarto.numero} ?</span>
                      <button
                        onClick={() => modalQuarto.removerQuarto(quarto.id)}
                        className={styles.removerQuartoButton}
                      >
                        ?
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={modalQuarto.abrirModal} className={styles.adicionarQuartoButton}>
                  + Adicionar outro quarto
                </button>
                <p className={styles.totalQuartosHint}>
                  Total: {modalQuarto.quartosSelecionados.length} quarto(s)
                </p>
              </div>
            ) : (
              <button onClick={modalQuarto.abrirModal} className={styles.escolherButton}>
                Escolher Números dos Quartos
              </button>
            )}
          </div>
        </div>

        <div className={styles.columnRight}>
          <div className={styles.sectionCompact}>
            <h2 className={styles.sectionTitle}>2. Dados do hóspede</h2>
            <FormularioDadosPessoais
              guestData={guestData}
              setGuestData={setGuestData}
              errors={errors}
              isIdentificado={isIdentificado}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>3. Serviços Adicionais</h2>
        <ServicosAdicionais
          nights={nights}
          servicosSelecionados={servicosSelecionados}
          onServicosChange={setServicosSelecionados}
        />
      </div>

      <div className={styles.twoColumns}>
        <div className={styles.columnLeft}>
          <div className={styles.sectionCompact}>
            <h2 className={styles.sectionTitle}>4. Pagamento</h2>
            {paymentMethod === 'mpesa' && reservaId ? (
              <PagamentoMpesa
                reservaId={reservaId}
                valor={total}
                dadosReserva={{
                  ...dadosReservaParaBackend,
                  payment_method: 'mpesa',
                }}
                onSuccess={handlePagamentoConfirmado}
                onError={handlePagamentoFalhou}
                onPending={handlePagamentoPendente}
              />
            ) : (
              <MetodosPagamento
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                paymentDetails={paymentDetails}
                setPaymentDetails={setPaymentDetails}
                errors={errors}
              />
            )}
            {paymentMethod === 'cartao' && (
              <Elements stripe={stripePromise}>
                <StripeElements
                  reservaId={reservaId}
                  valor={total}
                  dadosReserva={{
                    ...dadosReservaParaBackend,
                    payment_method: 'cartao',
                  }}
                  onSuccess={handlePagamentoConfirmado}
                  onError={handlePagamentoFalhou}
                  onPending={handlePagamentoPendente}
                />
              </Elements>
            )}
          </div>
        </div>

        <div className={styles.columnRight}>
          <ResumoReserva
            tipoQuarto={tipoQuarto}
            checkIn={checkIn}
            checkOut={checkOut}
            nights={nights}
            pricePerNight={pricePerNight}
            quantidadeQuartos={quantidadeQuartos}
            servicosAdicionais={servicosSelecionados}
            taxaImposto={taxaImposto}
          />
        </div>
      </div>

      {isFormValid &&
        paymentMethod &&
        modalQuarto.quartosSelecionados.length > 0 &&
        paymentMethod !== 'mpesa' &&
        paymentMethod !== 'cartao' && (
          <ResumoFinal
            quartos={modalQuarto.quartosSelecionados}
            guestData={guestData}
            paymentMethod={paymentMethod}
            nights={nights}
            pricePerNight={pricePerNight}
            servicosAdicionais={servicosSelecionados}
            taxaImposto={taxaImposto}
          />
        )}

      {paymentMethod !== 'mpesa' && paymentMethod !== 'cartao' && (
        <BotaoConfirmarPagamento
          isFormValid={isFormValid && modalQuarto.quartosSelecionados.length > 0}
          isLoading={isLoading}
          onClick={handleConfirmPayment}
        />
      )}

      <ModalSelecionarQuarto
        isOpen={modalQuarto.isOpen}
        onClose={modalQuarto.cancelarSelecao}
        onConfirm={modalQuarto.confirmarSelecao}
        quartosTemp={modalQuarto.quartosTemp}
        onToggleTemp={modalQuarto.toggleQuartoTemp}
        tipoQuarto={tipoQuarto}
      />
    </div>
  );
};

export default Checkout;
