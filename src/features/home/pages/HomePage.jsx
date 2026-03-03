// ============================================
// PAGE: HomePage (Versão Final com Integração Completa)
// ============================================
// Responsabilidade: Orquestrar componentes e hooks da Home Feature
// VERSÃO CORRIGIDA - COM LOGS E SELECÃO FUNCIONAL
// ============================================

import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Componentes de layout
import { Header } from '../../../shared/components/layout/Header/Header.jsx';
import { Footer } from '../../../shared/components/layout/Footer/Footer.jsx';
import {
  Container,
  ContainerSize
} from '../../../shared/components/layout/Container/Container.jsx';

// Componentes de UI
import { Spinner, SpinnerSize } from '../../../shared/components/ui/Spinner/Spinner.jsx';
import { Button, ButtonVariant } from '../../../shared/components/ui/Button/Button.jsx';
import { useNotification } from '../../../shared/components/ui/Notification/Notification.jsx';

// Componentes da Home
import { Hero } from '../components/Hero/Hero.jsx';
import { RoomsSection } from '../components/RoomsSection/RoomsSection.jsx';
import { ReservationForm } from '../components/ReservationForm/ReservationForm.jsx';
import { ServicesSection } from '../components/ServicesSection/ServicesSection.jsx';

// Componentes de Pagamento
import { PaymentButton, PaymentSummary } from '../../../features/payment/components/index.js';

// Hooks da Home
import { useHomeData } from '../hooks/useHomeData.js';
import { useHomeReservation } from '../hooks/useHomeReservation.js';
import { useReservationForm } from '../hooks/useReservationForm.js';
import { useReservationValidation } from '../hooks/useReservationValidation.js';
import { useRoomOccupancy } from '../hooks/useRoomOccupancy.js';

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
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
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
        <Button variant={ButtonVariant.PRIMARY} onClick={onRetry} className="error-retry">
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

  // ESTADO PARA DEBUG
  const [showDebug, setShowDebug] = useState(false);
  const [selectedRoomState, setSelectedRoomState] = useState(null); // ESTADO LOCAL DE EMERGÊNCIA

  // ========================================
  // HOOKS DE DADOS
  // ========================================

  const {
    rooms,
    services,
    loading: dataLoading,
    error: dataError,
    initialized,
    refresh,
    loadRoomDetails,
    calculateReservationPrice,
    stats
  } = useHomeData({
    onError: (type, error) => {
      notification.error(`Erro ao carregar ${type}: ${error.message}`);
    }
  });

  // LOGS DE DEBUG
  useEffect(() => {
    if (rooms && rooms.length > 0) {
      console.log('🏨 Quartos carregados com sucesso:');
      rooms.forEach((room) => {
        console.log(
          `   • ${room.typeLabel} ${room.number}: ${room.pricePerNightFormatted} - Status: ${room.status}`
        );
      });
      console.log('📊 Estatísticas:', stats);
    }
  }, [rooms, stats]);

  // ========================================
  // HOOKS DE OCUPAÇÃO
  // ========================================

  const occupancy = useRoomOccupancy({
    onOccupancyChanged: (roomId, status) => {
      if (status === 'occupied') {
        notification.success(`Quarto reservado com sucesso!`);
      }
      refresh();
    },
    onError: (roomId, error) => {
      notification.error(`Erro ao processar quarto: ${error.message}`);
    },
    checkAvailability: (roomId) => {
      const room = rooms.find((r) => r.id === roomId);
      return room?.status === 'AVAILABLE';
    }
  });

  // ========================================
  // HOOKS DE RESERVA
  // ========================================

  const reservation = useHomeReservation({
    calculatePriceUseCase: { execute: calculateReservationPrice },
    onPriceCalculated: (breakdown) => {
      console.log('Preço calculado:', breakdown);
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
      const room = rooms.find((r) => r.id === roomId);
      const isAvailable = room?.status === 'AVAILABLE';
      return {
        isAvailable,
        reason: isAvailable ? null : 'Quarto ocupado'
      };
    },
    onValidationChange: (validationState) => {
      console.log('Validação atualizada:', validationState);
    }
  });

  // ========================================
  // HANDLERS - CORRIGIDOS
  // ========================================

  const handleRoomSelect = useCallback(
    async (room) => {
      console.log('🔥🔥🔥 [HomePage] handleRoomSelect INICIADO', room);
      console.log('🔥 [HomePage] reservation ANTES:', reservation.room);

      // Verificar disponibilidade
      if (room.status !== 'AVAILABLE') {
        notification.warning('Este quarto não está disponível no momento');
        return;
      }

      // ATUALIZAR RESERVATION
      reservation.selectRoom(room);
      
      // ATUALIZAR ESTADO LOCAL DE EMERGÊNCIA
      setSelectedRoomState(room);

      console.log('🔥 [HomePage] reservation DEPOIS:', reservation.room);
      console.log('🔥 [HomePage] selectedRoomState:', room);

      await loadRoomDetails(room.id);
      
      // ROLAR PARA O FORMULÁRIO
      setTimeout(() => {
        document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    },
    [reservation, loadRoomDetails, notification]
  );

  const handleServiceToggle = useCallback(
    (serviceId, isSelected) => {
      reservation.toggleService(serviceId);
    },
    [reservation]
  );

  const handleReservationSubmit = useCallback(
    async (state) => {
      if (!validation.isReady) {
        notification.warning('Por favor, verifique os dados da reserva');
        return;
      }

      try {
        if (state.room.status !== 'AVAILABLE') {
          notification.error('Quarto não está mais disponível');
          refresh();
          return;
        }

        const success = await occupancy.occupyRoom(state.room.id, {
          guestsCount: state.guests,
          reservationId: `RES-${Date.now()}`,
          checkIn: state.checkIn,
          checkOut: state.checkOut,
          services: state.selectedServices
        });

        if (success) {
          notification.success('Reserva confirmada com sucesso!');
          reservation.clearReservation();
          setSelectedRoomState(null);
          form.resetTouched();
        }
      } catch (error) {
        notification.error('Erro ao confirmar reserva. Tente novamente.');
        console.error('Erro na reserva:', error);
      }
    },
    [validation, occupancy, reservation, form, notification, refresh]
  );

  const handleRefresh = useCallback(() => {
    refresh();
    notification.info('Atualizando dados...');
  }, [refresh, notification]);

  const handleProceedToPayment = useCallback(() => {
    if (!validation.isReady) {
      notification.warning('Por favor, corrija os erros antes de prosseguir');
      return;
    }

    if (!reservation.room) {
      notification.warning('Selecione um quarto para continuar');
      return;
    }

    if (!reservation.checkIn || !reservation.checkOut) {
      notification.warning('Selecione as datas da reserva');
      return;
    }

    if (reservation.nights < 1) {
      notification.warning('Período de reserva inválido');
      return;
    }

    if (reservation.room.status !== 'AVAILABLE') {
      notification.error('Este quarto não está mais disponível');
      refresh();
      return;
    }

    const checkoutData = {
      room: {
        id: reservation.room.id,
        number: reservation.room.number,
        type: reservation.room.type,
        typeLabel: reservation.room.typeLabel,
        capacity: reservation.room.capacity,
        pricePerNight: reservation.room.pricePerNight,
        formattedPrice: reservation.room.pricePerNightFormatted
      },
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      nights: reservation.nights,
      guests: reservation.guests,
      services: reservation.selectedServices.map((id) => {
        const service = services?.all?.find((s) => s.id === id) || {
          id,
          name: `Serviço ${id}`,
          price: { amount: 50, currency: 'MZN' }
        };
        return {
          id: service.id,
          name: service.name,
          price: service.price?.amount || 50,
          currency: service.price?.currency || 'MZN',
          formattedPrice: `${service.price?.amount || 50} ${service.price?.currency || 'MZN'}`
        };
      }),
      roomPrice: reservation.priceBreakdown?.roomPrice?.subtotal || 0,
      servicesPrice: reservation.servicesTotal,
      taxes: reservation.taxesTotal,
      total: reservation.total,
      timestamp: new Date().toISOString(),
      reservationId: `RES-${Date.now()}`
    };

    console.log('📋 Dados completos para checkout:', checkoutData);
    notification.info('Redirecionando para página de pagamento...');
    navigate('/checkout', { state: { reservation: checkoutData } });
  }, [reservation, validation, notification, navigate, refresh, services]);

  // ========================================
  // PAINEL DE DEBUG
  // ========================================

  const DebugPanel = () => (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: '300px',
        maxHeight: '400px',
        overflow: 'auto',
        pointerEvents: 'none'
      }}
    >
      <button
        onClick={() => setShowDebug(false)}
        style={{
          float: 'right',
          pointerEvents: 'auto',
          cursor: 'pointer',
          background: 'transparent',
          border: 'none',
          color: 'white',
          fontSize: '16px'
        }}
      >
        X
      </button>
      <h4>Debug - Quartos</h4>
      <pre>
        {JSON.stringify(
          rooms?.map((r) => ({
            id: r.id,
            number: r.number,
            type: r.type,
            price: r.pricePerNight?.amount,
            formattedPrice: r.pricePerNightFormatted,
            currency: r.pricePerNight?.currency,
            status: r.status
          })),
          null,
          2
        )}
      </pre>
    </div>
  );

  // ========================================
  // RENDERIZAÇÃO CONDICIONAL
  // ========================================

  if (dataLoading && !initialized) {
    return <LoadingScreen />;
  }

  if (dataError && !initialized) {
    return <ErrorScreen error={dataError} onRetry={handleRefresh} />;
  }

  // USAR ESTADO LOCAL SE RESERVATION.ROOM FOR NULO
  const displayRoom = reservation.room || selectedRoomState;

  return (
    <div className="home-page">
      <Header onNavigate={navigate} currentPath={window.location.pathname} transparent={true} />

      <main id="main-content" className="home-main">
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
          {dataLoading ? (
            <div className="rooms-loading" style={{ textAlign: 'center', padding: '40px' }}>
              <Spinner size={SpinnerSize.MEDIUM} />
              <p style={{ marginTop: '20px', color: '#666' }}>Carregando quartos disponíveis...</p>
            </div>
          ) : rooms.length > 0 ? (
            <RoomsSection
              rooms={rooms}
              onSelectRoom={handleRoomSelect}
              selectedRoomId={displayRoom?.id}
              title="Nossos Quartos"
              subtitle="Escolha o quarto perfeito para sua estadia"
              occupancyHook={occupancy}
            />
          ) : (
            <div className="no-rooms" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
                Nenhum quarto disponível no momento.
              </p>
              <Button variant={ButtonVariant.SECONDARY} onClick={refresh}>
                Tentar novamente
              </Button>
            </div>
          )}

          <section id="reservation" className="reservation-section">
            <div className="reservation-grid">
              <div className="reservation-form-wrapper">
                <h2 className="section-title">Faça sua Reserva</h2>
                <ReservationForm
                  selectedRoom={displayRoom}
                  onCalculatePrice={calculateReservationPrice}
                  onSubmit={form.handleSubmit}
                  priceBreakdown={reservation.priceBreakdown}
                  isCalculating={reservation.isCalculating}
                  reservationHook={reservation}
                />
              </div>

              <div className="reservation-summary-wrapper">
                <PaymentSummary
                  room={displayRoom}
                  checkIn={reservation.checkIn}
                  checkOut={reservation.checkOut}
                  guests={reservation.guests}
                  nights={reservation.nights}
                  services={reservation.selectedServices.map((id) => {
                    const service = services?.all?.find((s) => s.id === id) || {
                      id,
                      name: `Serviço ${id}`,
                      price: { amount: 50, currency: 'MZN' }
                    };
                    return {
                      id: service.id,
                      name: service.name,
                      price: service.price?.amount || 50,
                      currency: service.price?.currency || 'MZN'
                    };
                  })}
                  roomPrice={reservation.priceBreakdown?.roomPrice?.subtotal || 0}
                  servicesPrice={reservation.servicesTotal}
                  taxes={reservation.taxesTotal}
                  total={reservation.total}
                  showBreakdown={true}
                  currency="MZN"
                />

                <PaymentButton
                  isEnabled={validation.isReady && displayRoom && !reservation.isCalculating}
                  total={reservation.total}
                  onProceed={handleProceedToPayment}
                  loading={reservation.isCalculating}
                  currency="MZN"
                />

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

          <ServicesSection
            services={services.categories?.food?.services || []}
            selectedServiceIds={reservation.selectedServices}
            onServiceToggle={handleServiceToggle}
            title="Serviços Adicionais"
            subtitle="Personalize sua estadia com nossos serviços exclusivos"
          />
        </Container>
      </main>

      <Footer onNavigate={navigate} showNewsletter={true} companyName="Hotel Paradise" />

      {showDebug && <DebugPanel />}
    </div>
  );
};

HomePage.displayName = 'HomePage';

export default HomePage;