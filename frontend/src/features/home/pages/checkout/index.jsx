// =====================================================
// HOTEL PARADISE - CHECKOUT (COM MODAL DE SELEÇÃO DE QUARTO)
// =====================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@contexts/CartContext';
import { useCliente } from "@hooks/useCliente";
import { useModalQuarto } from './hooks/useModalQuarto';
import ResumoReserva from './components/ResumoReserva';
import FormularioHospede from './components/FormularioHospede';
import MetodosPagamento from './components/MetodosPagamento';
import ModalSelecionarQuarto from './components/room-selection/ModalSelecionarQuarto';
import styles from './styles/Checkout.module.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { reservation, room } = useCart();
  const { cliente, isIdentificado } = useCliente();
  const modalQuarto = useModalQuarto();

  const [step, setStep] = useState(1);
  const [guestData, setGuestData] = useState({
    nome: cliente?.name || '',
    telefone: cliente?.phone || '',
    documento: cliente?.document || '',
    email: cliente?.email || ''
  });

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
        
        {/* Botão para abrir modal ou mostrar quarto selecionado */}
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
        <FormularioHospede 
          guestData={guestData}
          setGuestData={setGuestData}
          isIdentificado={isIdentificado}
        />
      </div>

      {/* STEP 3: Pagamento */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>3. Pagamento</h2>
        <MetodosPagamento />
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