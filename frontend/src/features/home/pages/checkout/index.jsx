import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@contexts/CartContext';
import { useServices } from '@contexts/ServicesContext';
import { useCliente } from '@hooks/useCliente';
import { useI18n } from '../../../../contexts/I18nContext';
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
import CheckoutHeader from './components/CheckoutHeader/CheckoutHeader';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Função para converter IDs mock para UUIDs reais
const getRealRoomId = (mockId) => {
  if (!mockId) return null;
  
  const roomMap = {
    '38': '533fc3b1-864b-40b6-81a9-77a414f6872f',
    '28': 'd4cbe344-e7a2-43bd-8b6d-887ad72edf1d',
    '44': '11b74d81-a107-4480-a109-c93bc37038d5',
    '04': '3fdadf3f-b5b5-444b-bda9-42beaacf6bfc',
    '05': '56a0c94f-8d9b-44c8-b984-f6b311393402',
    '03': 'a7aa148b-922c-4641-b9c3-064242a4bc8f',
    '43': '8549a901-efac-4037-889b-fab8c10f9246',
    '39': '3a24563f-8e23-4995-bda6-9c6b93899b6f',
    '07': 'd129ba9d-bb77-4294-a4d6-795a3806aa47',
    '06': '7350e309-0234-4b10-97b6-887b0528b92c',
    'room-002': 'd4cbe344-e7a2-43bd-8b6d-887ad72edf1d',
    'room-004': '3fdadf3f-b5b5-444b-bda9-42beaacf6bfc',
    'mock-43': '8549a901-efac-4037-889b-fab8c10f9246',
    'mock-45': '11b74d81-a107-4480-a109-c93bc37038d5',
    'mock-47': '3a24563f-8e23-4995-bda6-9c6b93899b6f'
  };
  
  return roomMap[mockId] || mockId;
};

const Checkout = () => {
  const navigate = useNavigate();
  const { t } = useI18n(); // ✅ Consumindo i18n
  const { reservation, room } = useCart();
  const { servicosSelecionados: servicoscontexto } = useServices();
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
  const [taFecharaImposto] = useState(0.05);
  const [reservaId, setReservaId] = useState(null);
  const [pagamentoStatus, setPagamentoStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const { errors, isFormValid } = useValidacaoCheckout(guestData, paymentMethod, paymentDetails);

  useEffect(() => {
    if (!reservation && !room) navigate('/');
  }, [reservation, room, navigate]);

  useEffect(() => {
    if (servicoscontexto && servicoscontexto.length > 0) {
      setServicosSelecionados(servicoscontexto);
    }
  }, [servicoscontexto]);

  useEffect(() => {
    if (!reservaId) {
      const tempId = `TEMP_${Date.now()}`;
      setReservaId(tempId);
    }
  }, [reservaId]);

  if (!reservation && !room) return null;

  const tipoQuarto = reservation?.roomType || room?.type || 'Standard';
  const checkIn = reservation?.checkIn || '';
  const checkOut = reservation?.checkOut || '';
  const nights = reservation?.nights || 1;
  const pricePerNight = reservation?.pricePerNight || room?.price_per_night || 0;
  const quantidadeQuartos = modalQuarto.quartosSelecionados.length || 1;

  const subtotalQuartos = pricePerNight * nights * quantidadeQuartos;
  const subtotalServicos = servicosSelecionados.reduce((total, servico) => {
    const preco = servico.tipo === 'por_noite' ? servico.preco * nights : servico.preco;
    return total + preco;
  }, 0);
  const subtotal = subtotalQuartos + subtotalServicos;
  const taFecharas = subtotal * taFecharaImposto;
  const total = subtotal + taFecharas;

  const primeiroQuarto = modalQuarto.quartosSelecionados[0];
  const room_id = getRealRoomId(primeiroQuarto?.id || room?.id || reservation?.roomId);
  
  const room_ids_converted = modalQuarto.quartosSelecionados.map((q) => getRealRoomId(q.id)).filter(id => id);

  const dadosReservaParaBackend = {
    room_id: room_id,
    room_ids: room_ids_converted,
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
    console.log('✅ Pagamento confirmado!', data);
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
    console.error('❌ Pagamento falhou:', error);
    setPagamentoStatus('failed');
    const errorMsg = error?.message || t('errors.payment_declined');
    setErrorMessage(errorMsg);
    
    // Limpar mensagem após 5 segundos
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const handlePagamentoPendente = (data) => {
    console.log('⏳ Pagamento pendente:', data);
    setPagamentoStatus('pending');
  };

  const handleConfirmPayment = async () => {
    if (!isFormValid) {
      setErrorMessage(t('errors.required_field'));
      return;
    }
    
    if (modalQuarto.quartosSelecionados.length === 0 && !room_id) {
      setErrorMessage(t('checkout.no_room_selected'));
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const respostaReserva = await api.post('/reservas', {
        ...dadosReservaParaBackend,
        payment_method: paymentMethod,
      });

      if (!respostaReserva.data.success) {
        throw new Error(respostaReserva.data.message || t('errors.booking_creation_failed'));
      }

      const { reservation_code } = respostaReserva.data.data;
      console.log('✅ Reserva criada no banco:', reservation_code);

      await api.put(`/reservas/${reservation_code}/confirmar-pagamento`, {
        payment_method: paymentMethod,
      });

      handlePagamentoConfirmado({ reservation_code });

    } catch (error) {
      console.error('❌ Erro:', error);
      const mensagem = error.response?.data?.message || error.message || t('errors.generic');
      setErrorMessage(mensagem);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <CheckoutHeader isIdentificado={isIdentificado} t={t} />

      {/* Mensagem de erro global */}
      {errorMessage && (
        <div className={styles.globalError}>
          <span className={styles.errorIcon}>⚠️</span>
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className={styles.closeError}>Fechar</button>
        </div>
      )}

      <div className={styles.twoColumns}>
        <div className={styles.columnLeft}>
          <div className={styles.sectionCompact}>
            <h2 className={styles.sectionTitle}>1. {t('reservation.choose_rooms')}</h2>
            {modalQuarto.quartosSelecionados.length > 0 ? (
              <div className={styles.quartosSelecionados}>
                <div className={styles.quartosList}>
                  {modalQuarto.quartosSelecionados.map((quarto) => (
                    <div key={quarto.id} className={styles.quartoSelecionadoItem}>
                      <span>🏨 {t('rooms.room')} {quarto.numero} ✅</span>
                      <button
                        onClick={() => modalQuarto.removerQuarto(quarto.id)}
                        className={styles.removerQuartoButton}
                      >
                        Fechar
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={modalQuarto.abrirModal} className={styles.adicionarQuartoButton}>
                  + {t('reservation.add_another_room')}
                </button>
                <p className={styles.totalQuartosHint}>
                  {t('reservation.total_rooms')}: {modalQuarto.quartosSelecionados.length}
                </p>
              </div>
            ) : (
              <button onClick={modalQuarto.abrirModal} className={styles.escolherButton}>
                {t('reservation.select_room_numbers')}
              </button>
            )}
          </div>
        </div>

        <div className={styles.columnRight}>
          <div className={styles.sectionCompact}>
            <h2 className={styles.sectionTitle}>2. {t('checkout.personal_data')}</h2>
            <FormularioDadosPessoais
              guestData={guestData}
              setGuestData={setGuestData}
              errors={errors}
              isIdentificado={isIdentificado}
              t={t}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>3. {t('checkout.additional_services')}</h2>
        <ServicosAdicionais
          nights={nights}
          servicosSelecionados={servicosSelecionados}
          onServicosChange={setServicosSelecionados}
          t={t}
        />
      </div>

      <div className={styles.twoColumns}>
        <div className={styles.columnLeft}>
          <div className={styles.sectionCompact}>
            <h2 className={styles.sectionTitle}>4. {t('checkout.payment')}</h2>
            {paymentMethod === 'mpesa' ? (
              <PagamentoMpesa
                reservaId={reservaId}
                valor={total}
                dadosReserva={dadosReservaParaBackend}
                onSuccess={handlePagamentoConfirmado}
                onError={handlePagamentoFalhou}
                onPending={handlePagamentoPendente}
                t={t}
              />
            ) : (
              <MetodosPagamento
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                paymentDetails={paymentDetails}
                setPaymentDetails={setPaymentDetails}
                errors={errors}
                t={t}
              />
            )}
            {paymentMethod === 'cartao' && (
              <Elements stripe={stripePromise}>
                <StripeElements
                  reservaId={reservaId}
                  valor={total}
                  dadosReserva={dadosReservaParaBackend}
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
            taFecharaImposto={taFecharaImposto}
            t={t}
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
            taFecharaImposto={taFecharaImposto}
          />
        )}

      {paymentMethod !== 'mpesa' && paymentMethod !== 'cartao' && (
        <BotaoConfirmarPagamento
          isFormValid={isFormValid && modalQuarto.quartosSelecionados.length > 0}
          isLoading={isLoading}
          onClick={handleConfirmPayment}
          t={t}
        />
      )}

      <ModalSelecionarQuarto
        isOpen={modalQuarto.isOpen}
        onClose={modalQuarto.cancelarSelecao}
        onConfirm={modalQuarto.confirmarSelecao}
        quartosTemp={modalQuarto.quartosTemp}
        onToggleTemp={modalQuarto.toggleQuartoTemp}
        tipoQuarto={tipoQuarto}
        t={t}
      />
    </div>
  );
};

export default Checkout;






