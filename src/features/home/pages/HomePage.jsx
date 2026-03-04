import React, { useRef, useCallback } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import RoomsSection from '../components/RoomsSection/RoomsSection';
import Footer from '../components/Footer';
import useRoomSelection from '../hooks/useRoomSelection';
import './home.css';

/**
 * HomePage - Página principal com seleção de quartos integrada
 */
const HomePage = () => {
  // ==========================================================================
  // REFS
  // ==========================================================================

  const reservationRef = useRef(null);

  // ==========================================================================
  // HOOKS
  // ==========================================================================

  const { selectedRoom, selectRoom } = useRoomSelection();

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleRoomSelect = useCallback((room) => {
    selectRoom(room);
    
    // Scroll suave para o formulário após selecionar quarto
    setTimeout(() => {
      reservationRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 200);
  }, [selectRoom]);

  const handleCtaClick = useCallback(() => {
    reservationRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="home-page">
      <Header transparent={true} />

      <main className="home-page__main">
        <Hero onCtaClick={handleCtaClick} />

        {/* Seção de quartos com seleção */}
        <RoomsSection
          onSelectRoom={handleRoomSelect}
          title="Nossos Quartos"
          subtitle="Escolha o quarto perfeito para sua estadia"
        />

        {/* Seção de reserva - será preenchida no Dia 7/8 */}
        <section 
          id="reservation" 
          className="home-page__section home-page__section--highlight"
          ref={reservationRef}
        >
          <div className="container">
            <h2 className="section-title">Faça sua Reserva</h2>
            
            {selectedRoom ? (
              <div className="selected-room-preview">
                <p>
                  Quarto selecionado: <strong>{selectedRoom.number}</strong>
                </p>
                <p className="text-muted">
                  Preço: {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: selectedRoom.price.currency,
                    minimumFractionDigits: 0,
                  }).format(selectedRoom.price.amount)}/noite
                </p>
                <p className="text-muted">Capacidade: {selectedRoom.capacity} hóspedes</p>
              </div>
            ) : (
              <p className="text-muted">Selecione um quarto para fazer sua reserva</p>
            )}
          </div>
        </section>

        {/* Seção de serviços (Dia 9) */}
        <section id="services" className="home-page__section">
          <div className="container">
            <h2 className="section-title">Serviços Adicionais</h2>
            <p className="section-subtitle">
              Personalize sua estadia com nossos serviços exclusivos
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;