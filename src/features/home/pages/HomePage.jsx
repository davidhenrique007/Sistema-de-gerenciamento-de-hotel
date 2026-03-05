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
import useRooms from '../hooks/useRooms';
import useNotification from "../../../shared/components/ui/Notification/useNotification";
import './home.css';

const HomePage = () => {
  // ==========================================================================
  // HOOKS
  // ==========================================================================

  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotification();
  const { formRef, scrollToForm, scrollToFormWithDelay } = useScrollToForm({ 
    offset: 80,
    behavior: 'smooth',
  });

  // ✅ Carregar quartos
  const { rooms, isLoading: roomsLoading, error: roomsError } = useRooms();

  // ✅ Passar rooms para o hook de seleção
  const { selectedRoom, selectRoom, selectedRoomId } = useRoomSelection(rooms || []);

  const { 
    selectedServices, 
    toggleService, 
    selectedServicesDetails,
    selectedServicesTotal,
    clearSelectedServices,
  } = useServices();

  // ==========================================================================
  // LOGS DE DEBUG (CORRIGIDOS - com verificação)
  // ==========================================================================

  useEffect(() => {
    console.log('🏠 [HomePage] Estado atual:');
    console.log('   📍 rooms carregados:', rooms?.length || 0);  // ← CORRIGIDO
    console.log('   📍 selectedRoomId:', selectedRoomId);
    console.log('   📍 selectedRoom:', selectedRoom?.number || 'nenhum');
    console.log('   📍 selectedServices:', selectedServices?.length || 0);
  }, [rooms, selectedRoomId, selectedRoom, selectedServices]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleRoomSelect = useCallback((room) => {
    console.log('🛏️ [HomePage] Quarto selecionado:', room?.number);
    if (room) {
      selectRoom(room);
      scrollToFormWithDelay(300);
    }
  }, [selectRoom, scrollToFormWithDelay]);

  const handleReservationSubmit = useCallback(async (reservationData) => {
    try {
      const completeReservation = {
        ...reservationData,
        selectedServices: selectedServicesDetails || [],
        servicesTotal: selectedServicesTotal || 0,
        createdAt: new Date().toISOString(),
        reservationId: `RES-${Date.now()}`,
      };

      console.log('📋 Reserva completa:', completeReservation);

      await new Promise(resolve => setTimeout(resolve, 800));

      notifySuccess('Reserva processada com sucesso!');
      
      if (clearSelectedServices) clearSelectedServices();

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

  const handleServiceToggle = useCallback((serviceId, isSelected) => {
    if (toggleService) {
      toggleService(serviceId);
    }
  }, [toggleService]);

  // ==========================================================================
  // RENDER: LOADING
  // ==========================================================================

  if (roomsLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
          <p>Carregando quartos...</p>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // RENDER: ERROR
  // ==========================================================================

  if (roomsError) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center', padding: '20px', background: '#fee2e2', borderRadius: '8px' }}>
          <p style={{ color: '#b91c1c', marginBottom: '10px' }}>Erro ao carregar quartos: {roomsError}</p>
          <button onClick={() => window.location.reload()} style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // RENDER: SUCCESS
  // ==========================================================================

  return (
    <div className="home-page">
      <Header transparent={true} />

      <main className="home-page__main">
        <Hero 
          onCtaClick={scrollToForm}
          size="small"     
          parallax={true}
          title="Hotel Paradise"
          subtitle="O paraíso perfeito para suas férias dos sonhos"
          ctaText="Reservar Agora"
        />

        <RoomsSection
          onSelectRoom={handleRoomSelect}
          selectedRoomId={selectedRoomId}
          title="Nossos Quartos"
          subtitle="Escolha o quarto perfeito para sua estadia"
        />

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

            </div>
          </div>
        </section>

        <ServicesSection
          onServiceToggle={handleServiceToggle}
          selectedServiceIds={selectedServices || []}
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