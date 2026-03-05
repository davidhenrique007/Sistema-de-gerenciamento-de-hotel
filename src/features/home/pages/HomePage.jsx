import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import RoomsSection from '../components/RoomsSection/RoomsSection';
import { ReservationForm } from '../components/ReservationForm';
import ServicesSection from '../components/ServicesSection';
import Footer from '../components/Footer';
import useRoomSelection from '../hooks/useRoomSelection';
import useScrollToForm from '../hooks/useScrollToForm';
import useServices from '../hooks/useServices';
import useNotification from "../../../shared/components/ui/Notification/useNotification"
import './home.css';

/**
 * HomePage - Página principal completa e finalizada
 * 
 * Integra todos os componentes da feature home:
 * - Header com navegação responsiva
 * - Hero com scroll automático
 * - Seção de quartos com seleção
 * - Formulário de reserva completo
 * - Seção de serviços interativa
 * - Footer institucional
 */
const HomePage = () => {
  // ==========================================================================
  // HOOKS GLOBAIS
  // ==========================================================================

  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotification();
  const { formRef, scrollToForm, scrollToFormWithDelay } = useScrollToForm({ 
    offset: 80,
    behavior: 'smooth',
  });

  // ==========================================================================
  // HOOKS DE DOMÍNIO
  // ==========================================================================

  const { selectedRoom, selectRoom } = useRoomSelection();
  const { 
    selectedServices, 
    toggleService, 
    selectedServicesDetails,
    selectedServicesTotal,
    clearSelectedServices,
  } = useServices();

  // ==========================================================================
  // LOGS DE DEBUG (remover em produção)
  // ==========================================================================

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🏨 [HomePage] Renderizada');
      console.log('   📍 selectedRoom:', selectedRoom?.number);
      console.log('   📍 selectedServices:', selectedServices.length);
    }
  }, [selectedRoom, selectedServices]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  /**
   * Seleciona um quarto e rola para o formulário
   */
  const handleRoomSelect = useCallback((room) => {
    selectRoom(room);
    scrollToFormWithDelay(300);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🛏️ Quarto ${room.number} selecionado`);
    }
  }, [selectRoom, scrollToFormWithDelay]);

  /**
   * Submete a reserva e redireciona para checkout
   */
  const handleReservationSubmit = useCallback(async (reservationData) => {
    try {
      // Combinar dados da reserva com serviços selecionados
      const completeReservation = {
        ...reservationData,
        selectedServices: selectedServicesDetails,
        servicesTotal: selectedServicesTotal,
        createdAt: new Date().toISOString(),
        reservationId: `RES-${Date.now()}`,
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('📋 Reserva completa:', completeReservation);
      }

      // Simular envio para API
      await new Promise(resolve => setTimeout(resolve, 800));

      notifySuccess('Reserva processada com sucesso!');
      
      // Limpar seleções após reserva
      clearSelectedServices();

      // Redirecionar para checkout
      setTimeout(() => {
        navigate('/checkout', { 
          state: { reservation: completeReservation },
        });
      }, 1000);

    } catch (error) {
      console.error('❌ Erro na reserva:', error);
      notifyError('Erro ao processar reserva. Tente novamente.');
    }
  }, [navigate, notifySuccess, notifyError, selectedServicesDetails, selectedServicesTotal, clearSelectedServices]);

  /**
   * Alterna seleção de serviços
   */
  const handleServiceToggle = useCallback((serviceId, isSelected) => {
    toggleService(serviceId);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${isSelected ? '✅' : '❌'} Serviço ${serviceId} ${isSelected ? 'adicionado' : 'removido'}`);
    }
  }, [toggleService]);

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="home-page">
      <Header transparent={true} />

      <main className="home-page__main">
        {/* ======================================================================
             HERO SECTION
        ====================================================================== */}
        <Hero 
          onCtaClick={scrollToForm}
          size="small"     
          parallax={true}
          title="Hotel Paradise"
          subtitle="O paraíso perfeito para suas férias dos sonhos"
          ctaText="Reservar Agora"
        />

        {/* ======================================================================
             ROOMS SECTION
        ====================================================================== */}
        <RoomsSection
          onSelectRoom={handleRoomSelect}
          title="Nossos Quartos"
          subtitle="Escolha o quarto perfeito para sua estadia"
        />

        {/* ======================================================================
             RESERVATION SECTION
        ====================================================================== */}
        <section 
          id="reservation" 
          className="home-page__section home-page__section--highlight"
          ref={formRef}
          aria-labelledby="reservation-title"
        >
          <div className="container">
            <h2 id="reservation-title" className="section-title">
              Faça sua Reserva
            </h2>
            
            <div className="reservation-layout">
              <div className="reservation-form-wrapper">
                <ReservationForm
                  selectedRoom={selectedRoom}
                  onSubmit={handleReservationSubmit}
                />
              </div>

              {selectedRoom && (
                <aside className="selected-room-info" aria-label="Informações do quarto selecionado">
                  <h3>Quarto Selecionado</h3>
                  <div className="selected-room-card">
                    <p className="room-number">Quarto {selectedRoom.number}</p>
                    <p className="room-type">{selectedRoom.typeLabel}</p>
                    <p className="room-capacity">
                      <span aria-label="Capacidade">👥</span> {selectedRoom.capacity} {selectedRoom.capacity === 1 ? 'hóspede' : 'hóspedes'}
                    </p>
                    <p className="room-price">
                      <span aria-label="Preço por noite">💰</span>{' '}
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: selectedRoom.price.currency,
                        minimumFractionDigits: 0,
                      }).format(selectedRoom.price.amount)}/noite
                    </p>
                  </div>
                </aside>
              )}
            </div>
          </div>
        </section>

        {/* ======================================================================
             SERVICES SECTION
        ====================================================================== */}
        <ServicesSection
          onServiceToggle={handleServiceToggle}
          selectedServiceIds={selectedServices}
          title="Serviços Adicionais"
          subtitle="Personalize sua estadia com nossos serviços exclusivos"
        />
      </main>

      <Footer 
        companyName="Hotel Paradise"
        showNewsletter={true}
      />
    </div>
  );
};

export default HomePage;