// =====================================================
// HOTEL PARADISE - CHECKOUT (COM DADOS PESSOAIS E PAGAMENTO)
// =====================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@contexts/CartContext';
import { useCliente } from "@hooks/useCliente";
import { useModalQuarto } from './hooks/useModalQuarto';
import ResumoReserva from './components/ResumoReserva';
import ModalSelecionarQuarto from './components/room-selection/ModalSelecionarQuarto';

// NOVOS IMPORTS
import FormularioDadosPessoais from './components/FormularioDadosPessoais';
import MetodosPagamento from './components/MetodosPagamento';
import BotaoConfirmarPagamento from './components/BotaoConfirmarPagamento';
import ResumoFinal from './components/ResumoFinal';
import { useValidacaoCheckout } from './hooks/useValidacaoCheckout';

import styles from './styles/Checkout.module.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { reservation, room } = useCart();
  const { cliente, isIdentificado } = useCliente();
  const modalQuarto = useModalQuarto();

  // Estados para dados pessoais e pagamento
  const [guestData, setGuestData] = useState({
    nome: cliente?.name || '',
    telefone: cliente?.phone || '',
    documento: cliente?.document || '',
    email: cliente?.email || ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutConfirmed, setCheckoutConfirmed] = useState(false);

  // Validação do formulário
  const { errors, isFormValid } = useValidacaoCheckout(
    guestData,
    paymentMethod,
    paymentDetails
  );

  // Redirecionar se não houver reserva
  useEffect(() => {
    if (!reservation && !room) {
      navigate('/');
    }
  }, [reservation, room, navigate]);

  if (!reservation && !room) return null;

  // Dados da reserva
  const tipoQuarto = reservation?.roomType || room?.type || 'Standard';
  const checkIn = reservation?.checkIn || '';
  const checkOut = reservation?.checkOut || '';
  const nights = reservation?.nights || 1;
  const pricePerNight = reservation?.pricePerNight || room?.price_per_night || 0;
  const total = reservation?.total || pricePerNight * nights;

  // Confirmar pagamento
  const handleConfirmPayment = async () => {
    if (!isFormValid) return;
    if (!modalQuarto.quartoSelecionado) {
      alert('Por favor, selecione um quarto primeiro');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simular processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCheckoutConfirmed(true);
      // Aqui você pode redirecionar para a página de recibo
      // navigate('/recibo');
      
    } catch (error) {
      console.error('Erro no pagamento:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <span>Início</span> &gt; <span>Identificação</span> &gt; <span className={styles.active}>Checkout</span>
      </div>

      <h1 className={styles.title}>Checkout</h1>

      {/* STEP 1: Seleção de Quarto */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>1. Escolha seu quarto</h2>
        
        {modalQuarto.quartoSelecionado ? (
          <div className={styles.quartoSelecionado}>
            <span>Quarto {modalQuarto.quartoSelecionado.numero} ✅</span>
            <button onClick={modalQuarto.abrirModal} className={styles.trocarButton}>
              Trocar
            </button>
          </div>
        ) : (
          <button onClick={modalQuarto.abrirModal} className={styles.escolherButton}>
            Escolher Número do Quarto
          </button>
        )}
      </div>

      {/* STEP 2: Dados do Hóspede */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>2. Dados do hóspede</h2>
        <FormularioDadosPessoais
          guestData={guestData}
          setGuestData={setGuestData}
          errors={errors}
          isIdentificado={isIdentificado}
        />
      </div>

      {/* STEP 3: Pagamento */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>3. Pagamento</h2>
        <MetodosPagamento
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          paymentDetails={paymentDetails}
          setPaymentDetails={setPaymentDetails}
          errors={errors}
        />
      </div>

      {/* Resumo da Reserva */}
      <ResumoReserva
        tipoQuarto={tipoQuarto}
        checkIn={checkIn}
        checkOut={checkOut}
        nights={nights}
        pricePerNight={pricePerNight}
        total={total}
      />

      {/* Resumo Final (aparece quando formulário está preenchido) */}
      {isFormValid && paymentMethod && modalQuarto.quartoSelecionado && (
        <ResumoFinal
          quarto={modalQuarto.quartoSelecionado}
          guestData={guestData}
          paymentMethod={paymentMethod}
          total={total}
        />
      )}

      {/* Botão Confirmar Pagamento */}
      <BotaoConfirmarPagamento
        isFormValid={isFormValid && modalQuarto.quartoSelecionado}
        isLoading={isLoading}
        onClick={handleConfirmPayment}
      />

      {/* Modal de Seleção de Quarto */}
      <ModalSelecionarQuarto
        isOpen={modalQuarto.isOpen}
        onClose={modalQuarto.cancelarSelecao}
        onConfirm={modalQuarto.confirmarSelecao}
        quartoTemp={modalQuarto.quartoTemp}
        onSelectTemp={modalQuarto.selecionarQuartoTemp}
        tipoQuarto={tipoQuarto}
      />
    </div>
  );
};

export default Checkout;