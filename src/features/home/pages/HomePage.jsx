// ============================================
// PAGE: HomePage
// ============================================
// Responsabilidade: Orquestrar componentes e hooks da Home Feature
// Arquitetura: Camada de composição, sem lógica de negócio
// ============================================

import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Componentes de layout
import { Header } from '../../../shared/components/layout/Header/Header.jsx';
import { Footer } from '../../../shared/components/layout/Footer/Footer.jsx';
import { Container, ContainerSize } from '../../../shared/components/layout/Container/Container.jsx';

// Componentes de UI
import { Spinner, SpinnerSize } from '../../../shared/components/ui/Spinner/Spinner.jsx';
import { Button, ButtonVariant } from '../../../shared/components/ui/Button/Button.jsx';
import { useNotification } from '../../../shared/components/ui/Notification/Notification.jsx';

// Componentes da Home
import { Hero } from '../components/Hero/Hero.jsx';
import { RoomsSection } from '../components/RoomsSection/RoomsSection.jsx';
import { ReservationForm } from '../components/ReservationForm/ReservationForm.jsx';
import { ServicesSection } from '../components/ServicesSection/ServicesSection.jsx';
import { PriceSummary } from '../components/Summary/PriceSummary.jsx';

// Hooks da Home
import { useHomeData } from '../hooks/useHomeData.js';
import { useHomeReservation } from '../hooks/useHomeReservation.js';
import { useReservationForm } from '../hooks/useReservationForm.js';
import { useReservationValidation } from '../hooks/useReservationValidation.js';
import { useRoomOccupancy } from '../hooks/useRoomOccupancy.js';

// Estilos
import './home.css';

// ... resto do código permanece igual
// Estilos
import './home.css';

// ============================================
// CONSTANTES
// ============================================

const LOADING_MESSAGES = [
  'Carregando o paraíso...',
  'Preparando os quartos mais confortáveis...',
  'Buscando as melhores ofertas...',
  'Quase lá...'
];

// ============================================
// COMPONENTE DE LOADING
// ============================================

const LoadingScreen = () => {
  const [messageIndex, setMessageIndex] = React.useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-loading" role="status" aria-live="polite">
      <Spinner size={SpinnerSize.LARGE} />
      <p className="loading-message">{LOADING_MESSAGES[messageIndex]}</p>
    </div>
  );
};

// ============================================
// COMPONENTE DE ERRO
// ============================================

const ErrorScreen = ({ error, onRetry }) => {
  return (
    <div className="home-error" role="alert">
      <h2 className="error-title">Ops! Algo deu errado</h2>
      <p className="error-message">{error?.message || 'Não foi possível carregar a página'}</p>
      {onRetry && (
        <Button 
          variant={ButtonVariant.PRIMARY} 
          onClick={onRetry}
          className="error-retry"
        >
          Tentar Novamente
        </Button>
      )}
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const HomePage = () => {
  const navigate = useNavigate();
  const notification = useNotification();

  // ========================================
  // HOOKS DE DADOS
  // ========================================
  
  const {
    // Dados
    rooms,
    services,
    loading: dataLoading,
    error: dataError,
    initialized,
    
    // Funções
    refresh,
    refreshRooms,
    refreshServices,
    loadRoomDetails,
    calculateReservationPrice
  } = useHomeData({
    onError: (type, error) => {
      notification.error(`Erro ao carregar ${type}: ${error.message}`);
    }
  });

  // ========================================
  // HOOKS DE RESERVA
  // ========================================
  
  const reservation = useHomeReservation({
    calculatePriceUseCase: { execute: calculateReservationPrice },
    onPriceCalculated: (breakdown) => {
      console.log('Preço calculado:', breakdown);
    },
    onReservationChange: (state) => {
      console.log('Reserva atualizada:', state);
    }
  });

  const form = useReservationForm({
    reservationState: reservation.reservationState,
    onValidSubmit: async (state) => {
      await handleReservationSubmit(state);
    }
  });

  const validation = useReservationValidation({
    room: reservation.room,
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    guests: reservation.guests,
    selectedServices: reservation.selectedServices,
    validateAvailability: true,
    checkAvailability: async ({ roomId, checkIn, checkOut, guests }) => {
      // Integrar com serviço de disponibilidade
      return { isAvailable: true, reason: null };
    },
    onValidationChange: (validationState) => {
      console.log('Validação atualizada:', validationState);
    }
  });

  const occupancy = useRoomOccupancy({
    onOccupancyChanged: (roomId, status, data) => {
      notification.success(`Quarto ${roomId} ${status === 'occupied' ? 'reservado' : 'liberado'} com sucesso!`);
      refreshRooms(); // Atualizar lista de quartos
    },
    onError: (roomId, error) => {
      notification.error(`Erro ao processar quarto ${roomId}: ${error.message}`);
    }
  });

  // ========================================
  // HANDLERS
  // ========================================
  
  const handleRoomSelect = useCallback((room) => {
    reservation.selectRoom(room);
    loadRoomDetails(room.id);
  }, [reservation, loadRoomDetails]);

  const handleServiceToggle = useCallback((serviceId, isSelected) => {
    reservation.toggleService(serviceId);
  }, [reservation]);

  const handleReservationSubmit = useCallback(async (state) => {
    if (!validation.isReady) {
      notification.warning('Por favor, verifique os dados da reserva');
      return;
    }

    try {
      // Ocupar o quarto
      const success = await occupancy.occupyRoom(state.room.id, {
        guestsCount: state.guests,
        reservationId: `RES-${Date.now()}`,
        checkIn: state.checkIn,
        checkOut: state.checkOut,
        services: state.selectedServices
      });

      if (success) {
        notification.success('Reserva confirmada com sucesso!');
        
        // Redirecionar para página de confirmação (futuro)
        // navigate('/confirmacao', { state: { reserva: state } });
        
        // Limpar formulário
        reservation.clearReservation();
        form.resetTouched();
      }
    } catch (error) {
      notification.error('Erro ao confirmar reserva. Tente novamente.');
    }
  }, [validation, occupancy, reservation, form, notification, navigate]);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  // ========================================
  // RENDERIZAÇÃO CONDICIONAL
  // ========================================
  
  if (dataLoading && !initialized) {
    return <LoadingScreen />;
  }

  if (dataError && !initialized) {
    return <ErrorScreen error={dataError} onRetry={handleRefresh} />;
  }

  // ========================================
  // RENDER PRINCIPAL
  // ========================================
  
  return (
    <div className="home-page">
      <Header 
        onNavigate={navigate}
        currentPath={window.location.pathname}
        transparent={true}
      />

      <main id="main-content" className="home-main">
        {/* Hero Section */}
        <Hero 
          title="Hotel Paradise"
          subtitle="O paraíso perfeito para suas férias dos sonhos"
          ctaText="Reservar Agora"
          ctaAction="#reservation"
          onCtaClick={() => {
            document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        <Container size={ContainerSize.LARGE}>
          {/* Rooms Section */}
          <RoomsSection
            rooms={rooms}
            onSelectRoom={handleRoomSelect}
            selectedRoomId={reservation.room?.id}
            title="Nossos Quartos"
            subtitle="Escolha o quarto perfeito para sua estadia"
          />

          {/* Reservation Section */}
          <section id="reservation" className="reservation-section">
            <div className="reservation-grid">
              <div className="reservation-form-wrapper">
                <h2 className="section-title">Faça sua Reserva</h2>
                <ReservationForm
                  selectedRoom={reservation.room}
                  onCalculatePrice={calculateReservationPrice}
                  onSubmit={form.handleSubmit}
                  priceBreakdown={reservation.priceBreakdown}
                  isCalculating={reservation.isCalculating}
                />
              </div>

              <div className="reservation-summary-wrapper">
                <PriceSummary
                  breakdown={reservation.priceBreakdown}
                  isLoading={reservation.isCalculating}
                />
                
                {/* Status de validação */}
                {!validation.isReady && validation.hasErrors && (
                  <div className="validation-errors" role="alert">
                    <h4>Por favor, corrija os seguintes erros:</h4>
                    <ul>
                      {Object.values(validation.validationErrors).map((error, index) => (
                        <li key={index}>{error.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Services Section */}
          <ServicesSection
            services={services.categories?.food || []}
            selectedServiceIds={reservation.selectedServices}
            onServiceToggle={handleServiceToggle}
            title="Serviços Adicionais"
            subtitle="Personalize sua estadia com nossos serviços exclusivos"
          />
        </Container>
      </main>

      <Footer 
        onNavigate={navigate}
        showNewsletter={true}
        companyName="Hotel Paradise"
      />
    </div>
  );
};

HomePage.displayName = 'HomePage';

// ============================================
// EXPORTS
// ============================================

export default HomePage;