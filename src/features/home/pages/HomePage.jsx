// ============================================
// PAGE: HomePage (Versão Final com Integração Completa)
// ============================================
// Responsabilidade: Orquestrar componentes e hooks da Home Feature
// Integração: Use cases via DI, hooks de dados, reserva e pagamento
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

// Componentes de Pagamento
import { PaymentButton, PaymentSummary } from "../../../features/payment/components/index.js";

// Hooks da Home
import { useHomeData } from '../hooks/useHomeData.js';
import { useHomeReservation } from '../hooks/useHomeReservation.js';
import { useReservationForm } from '../hooks/useReservationForm.js';
import { useReservationValidation } from '../hooks/useReservationValidation.js';
import { useRoomOccupancy } from '../hooks/useRoomOccupancy.js';

// Use cases (via DI) - COMENTE ESTAS LINHAS SE NÃO TIVER OS HOOKS
// import { useListAvailableRooms, useGetRoomDetails } from '../../../di/homeDependencies.jsx';
// import { useUpdateRoomOccupancy } from '../../../di/homeDependencies.jsx';
// import { useCalculatePrice } from '../../../di/homeDependencies.jsx';

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
  // USE CASES (via DI) - DESCOMENTE QUANDO TIVER OS HOOKS
  // ========================================
  
  // const listAvailableRooms = useListAvailableRooms();
  // const getRoomDetails = useGetRoomDetails();
  // const updateRoomOccupancy = useUpdateRoomOccupancy();
  // const calculatePrice = useCalculatePrice();

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
    calculateReservationPrice
  } = useHomeData({
    // listAvailableRoomsUseCase: listAvailableRooms, // Descomente quando tiver
    // getRoomDetailsUseCase: getRoomDetails, // Descomente quando tiver
    onError: (type, error) => {
      notification.error(`Erro ao carregar ${type}: ${error.message}`);
    }
  });

  // ========================================
  // HOOKS DE OCUPAÇÃO
  // ========================================
  
  const occupancy = useRoomOccupancy({
    // updateRoomOccupancyUseCase: updateRoomOccupancy, // Descomente quando tiver
    onOccupancyChanged: (roomId, status) => {
      if (status === 'occupied') {
        notification.success(`Quarto reservado com sucesso!`);
      }
      refresh(); // Atualizar lista de quartos
    },
    onError: (roomId, error) => {
      notification.error(`Erro ao processar quarto: ${error.message}`);
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
      // Usar o hook de ocupação para verificar disponibilidade
      const isAvailable = occupancy.isRoomAvailable(roomId);
      return { isAvailable, reason: isAvailable ? null : 'Quarto ocupado' };
    },
    onValidationChange: (validationState) => {
      console.log('Validação atualizada:', validationState);
    }
  });

  // ========================================
  // HANDLERS
  // ========================================
  
  const handleRoomSelect = useCallback(async (room) => {
    // Verificar disponibilidade via hook de ocupação
    const isAvailable = occupancy.isRoomAvailable(room.id);
    
    if (!isAvailable) {
      notification.warning('Este quarto não está disponível no momento');
      return;
    }

    reservation.selectRoom(room);
    await loadRoomDetails(room.id);
  }, [reservation, loadRoomDetails, occupancy, notification]);

  const handleServiceToggle = useCallback((serviceId, isSelected) => {
    reservation.toggleService(serviceId);
  }, [reservation]);

  const handleReservationSubmit = useCallback(async (state) => {
    if (!validation.isReady) {
      notification.warning('Por favor, verifique os dados da reserva');
      return;
    }

    try {
      // Ocupar o quarto via hook de ocupação
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
  // HANDLER DE PAGAMENTO - ATUALIZADO
  // ========================================

  const handleProceedToPayment = useCallback(() => {
    // Validação final antes de prosseguir
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

    // Preparar dados completos para o checkout
    const checkoutData = {
      // Informações do quarto
      room: {
        id: reservation.room.id,
        number: reservation.room.number,
        type: reservation.room.type,
        typeLabel: reservation.room.typeLabel,
        capacity: reservation.room.capacity,
        pricePerNight: reservation.room.pricePerNight
      },
      // Datas
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      nights: reservation.nights,
      // Hóspedes
      guests: reservation.guests,
      // Serviços selecionados
      services: reservation.selectedServices.map(id => {
        // Buscar detalhes do serviço (se disponível)
        // Por enquanto, placeholder
        return {
          id,
          name: `Serviço ${id}`,
          price: 50
        };
      }),
      // Preços
      roomPrice: reservation.priceBreakdown?.roomPrice?.subtotal || 0,
      servicesPrice: reservation.servicesTotal,
      taxes: reservation.taxesTotal,
      total: reservation.total,
      // Metadados
      timestamp: new Date().toISOString(),
      reservationId: `RES-${Date.now()}`
    };

    console.log('📋 Dados completos para checkout:', checkoutData);
    
    notification.info('Redirecionando para página de pagamento...');
    
    // Navegar para página de checkout com os dados da reserva
    navigate('/checkout', { 
      state: { 
        reservation: checkoutData 
      } 
    });
  }, [reservation, validation, notification, navigate]);

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
          {/* Rooms Section com integração de ocupação */}
          <RoomsSection
            rooms={rooms}
            onSelectRoom={handleRoomSelect}
            selectedRoomId={reservation.room?.id}
            title="Nossos Quartos"
            subtitle="Escolha o quarto perfeito para sua estadia"
            occupancyHook={occupancy}
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
                  reservationHook={reservation}
                />
              </div>

              <div className="reservation-summary-wrapper">
                {/* Payment Summary - Resumo detalhado para pagamento */}
                <PaymentSummary
                  room={reservation.room}
                  checkIn={reservation.checkIn}
                  checkOut={reservation.checkOut}
                  guests={reservation.guests}
                  nights={reservation.nights}
                  services={reservation.selectedServices.map(id => ({
                    id,
                    name: `Serviço ${id}`,
                    price: 50 // Placeholder - substituir por preço real
                  }))}
                  roomPrice={reservation.priceBreakdown?.roomPrice?.subtotal || 0}
                  servicesPrice={reservation.servicesTotal}
                  taxes={reservation.taxesTotal}
                  total={reservation.total}
                  showBreakdown={true}
                />
                
                {/* Payment Button - Controlado por estado de validação */}
                <PaymentButton
                  isEnabled={validation.isReady && reservation.room && !reservation.isCalculating}
                  total={reservation.total}
                  onProceed={handleProceedToPayment}
                  loading={reservation.isCalculating}
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
            services={services.categories?.food?.services || []}
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

export default HomePage;