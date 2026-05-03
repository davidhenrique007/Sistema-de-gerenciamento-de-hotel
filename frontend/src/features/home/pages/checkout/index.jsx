import React, { useState, useEffect } from 'react';
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
import CheckoutHeader from './components/CheckoutHeader/CheckoutHeader';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Função para converter IDs mock para UUIDs reais
const getRealRoomId = (mockId) => {
  if (!mockId) return null;
  
  const roomMap = {
    // Quartos reais do banco
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
    // Mapeamento de nomes antigos
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
  const taxas = subtotal * taxaImposto;
  const total = subtotal + taxas;

  const primeiroQuarto = modalQuarto.quartosSelecionados[0];
  const room_id = getRealRoomId(primeiroQuarto?.id || room?.id || reservation?.roomId);
  
  // Converter todos os IDs do array
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

  console.log('📦 Dados da reserva para backend:', dadosReservaParaBackend);
  console.log('📦 reservaId:', reservaId);
  console.log('📦 paymentMethod:', paymentMethod);

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
  };

  const handlePagamentoPendente = (data) => {
    console.log('⏳ Pagamento pendente:', data);
    setPagamentoStatus('pending');
  };

  const handleConfirmPayment = async () => {
    if (!isFormValid) return;
    if (modalQuarto.quartosSelecionados.length === 0 && !room_id) {
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
      console.log('✅ Reserva criada no banco:', reservation_code);

      await api.put(`/reservas/${reservation_code}/confirmar-pagamento`, {
        payment_method: paymentMethod,
      });

      handlePagamentoConfirmado({ reservation_code });

    } catch (error) {
      console.error('❌ Erro:', error);
      const mensagem = error.response?.data?.message || 'Erro ao processar. Tente novamente.';
      alert(mensagem);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <CheckoutHeader isIdentificado={isIdentificado} />

      <div className={styles.twoColumns}>
        <div className={styles.columnLeft}>
          <div className={styles.sectionCompact}>
            <h2 className={styles.sectionTitle}>1. Escolha seus quartos</h2>
            {modalQuarto.quartosSelecionados.length > 0 ? (
              <div className={styles.quartosSelecionados}>
                <div className={styles.quartosList}>
                  {modalQuarto.quartosSelecionados.map((quarto) => (
                    <div key={quarto.id} className={styles.quartoSelecionadoItem}>
                      <span>🏨 Quarto {quarto.numero} ✅</span>
                      <button
                        onClick={() => modalQuarto.removerQuarto(quarto.id)}
                        className={styles.removerQuartoButton}
                      >
                        ✕
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
            {paymentMethod === 'mpesa' ? (
              <PagamentoMpesa
                reservaId={reservaId}
                valor={total}
                dadosReserva={dadosReservaParaBackend}
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
