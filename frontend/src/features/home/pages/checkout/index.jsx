import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@contexts/CartContext';
import { useServices } from '@contexts/ServicesContext';
import { useCliente } from "@hooks/useCliente";
import { useModalQuarto } from './hooks/useModalQuarto';
import ResumoReserva from './components/ResumoReserva';
import ModalSelecionarQuarto from './components/room-selection/ModalSelecionarQuarto';
import FormularioDadosPessoais from './components/FormularioDadosPessoais';
import MetodosPagamento from './components/MetodosPagamento';
import BotaoConfirmarPagamento from './components/BotaoConfirmarPagamento';
import ResumoFinal from './components/ResumoFinal';
import ServicosAdicionais from './components/ServicosAdicionais';
import { useValidacaoCheckout } from './hooks/useValidacaoCheckout';
import styles from './styles/Checkout.module.css';

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
    email: cliente?.email || ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [taxaImposto] = useState(0.05);

  const { errors, isFormValid } = useValidacaoCheckout(
    guestData,
    paymentMethod,
    paymentDetails
  );

  useEffect(() => {
    if (!reservation && !room) {
      navigate('/');
    }
  }, [reservation, room, navigate]);

  useEffect(() => {
    if (servicosContexto && servicosContexto.length > 0) {
      setServicosSelecionados(servicosContexto);
    }
  }, [servicosContexto]);

  if (!reservation && !room) return null;

  const tipoQuarto = reservation?.roomType || room?.type || 'Standard';
  const checkIn = reservation?.checkIn || '';
  const checkOut = reservation?.checkOut || '';
  const nights = reservation?.nights || 1;
  const pricePerNight = reservation?.pricePerNight || room?.price_per_night || 0;
  const quantidadeQuartos = modalQuarto.quartosSelecionados.length || 1;

  const subtotalQuartos = pricePerNight * nights * quantidadeQuartos;
  
  const subtotalServicos = servicosSelecionados.reduce((total, servico) => {
    const preco = servico.tipo === 'por_noite' 
      ? servico.preco * nights 
      : servico.preco;
    return total + preco;
  }, 0);
  
  const subtotal = subtotalQuartos + subtotalServicos;
  const taxas = subtotal * taxaImposto;
  const total = subtotal + taxas;

  const handleConfirmPayment = async () => {
    if (!isFormValid) return;
    if (modalQuarto.quartosSelecionados.length === 0) {
      alert('Por favor, selecione pelo menos um quarto');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Pagamento confirmado:', {
        quartos: modalQuarto.quartosSelecionados,
        guestData,
        paymentMethod,
        servicos: servicosSelecionados,
        subtotalQuartos,
        subtotalServicos,
        taxas,
        total
      });
      alert('Reserva confirmada com sucesso!');
    } catch (error) {
      console.error('Erro no pagamento:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <span>Início</span> &gt; <span>Identificação</span> &gt; <span className={styles.active}>Checkout</span>
      </div>

      <h1 className={styles.title}>Checkout</h1>

      {/* LINHA 1: Quartos (ESQUERDA) + Dados do Hóspede (DIREITA) */}
      <div className={styles.twoColumns}>
        {/* Coluna Esquerda - Seleção de Quartos */}
        <div className={styles.columnLeft}>
          <div className={styles.sectionCompact}>
            <h2 className={styles.sectionTitle}>1. Escolha seus quartos</h2>
            
            {modalQuarto.quartosSelecionados.length > 0 ? (
              <div className={styles.quartosSelecionados}>
                <div className={styles.quartosList}>
                  {modalQuarto.quartosSelecionados.map(quarto => (
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

        {/* Coluna Direita - Dados do Hóspede */}
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

      {/* LINHA 2: Serviços Adicionais (Largura Total) */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>3. Serviços Adicionais</h2>
        <ServicosAdicionais
          nights={nights}
          servicosSelecionados={servicosSelecionados}
          onServicosChange={setServicosSelecionados}
        />
      </div>

      {/* LINHA 3: Pagamento (ESQUERDA) + Resumo da Reserva (DIREITA) */}
      <div className={styles.twoColumns}>
        {/* Coluna Esquerda - Pagamento */}
        <div className={styles.columnLeft}>
          <div className={styles.sectionCompact}>
            <h2 className={styles.sectionTitle}>4. Pagamento</h2>
            <MetodosPagamento
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              paymentDetails={paymentDetails}
              setPaymentDetails={setPaymentDetails}
              errors={errors}
            />
          </div>
        </div>

        {/* Coluna Direita - Resumo da Reserva */}
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

      {/* Resumo Final */}
      {isFormValid && paymentMethod && modalQuarto.quartosSelecionados.length > 0 && (
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

      {/* Botão Confirmar Pagamento */}
      <BotaoConfirmarPagamento
        isFormValid={isFormValid && modalQuarto.quartosSelecionados.length > 0}
        isLoading={isLoading}
        onClick={handleConfirmPayment}
      />

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