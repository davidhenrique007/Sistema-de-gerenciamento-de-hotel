import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import RoomsSection from '../components/RoomsSection/RoomsSection';
import { ReservationForm } from '../components/ReservationForm';
import ServicesSection from '../components/ServicesSection';
import Footer from '../components/Footer';
import RoomDetailsModal from '../components/RoomsSection/RoomDetailsModal';
import useRoomSelection from '../hooks/useRoomSelection';
import useScrollToForm from '../hooks/useScrollToForm';
import useServices from '../hooks/useServices';
import useRooms from '../hooks/useRooms';
import useNotification from "../../../shared/components/ui/Notification/useNotification";
import { useCart } from '../../../contexts/CartContext';
import './home.css';

const HomePage = () => {
  const navigate = useNavigate();
  const cart = useCart();
  console.log("🔥🔥🔥 useCart retornou:", cart);
  console.log("🔥🔥🔥 selectRoom existe?", !!cart.selectRoom);
  const { selectRoom } = cart;
  const { notifySuccess, notifyError } = useNotification();
  const { formRef, scrollToForm, scrollToFormWithDelay } = useScrollToForm({
    offset: 80,
    behavior: 'smooth',
  });

  const { rooms } = useRooms();
  const { selectedRoom, selectRoom: selectLocalRoom, selectedRoomId } = useRoomSelection(rooms || []);
  const {
    selectedServices,
    toggleService,
    selectedServicesDetails,
    selectedServicesTotal,
    clearSelectedServices,
  } = useServices();

  const [selectedRoomForDetails, setSelectedRoomForDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    console.log('🏠 [HomePage] Estado:');
    console.log('   rooms:', rooms?.length || 0);
    console.log('   selectedRoom:', selectedRoom?.number || 'nenhum');
  }, [rooms, selectedRoom]);

  const handleRoomSelect = useCallback((room) => {
    console.log("🔥🔥🔥 handleRoomSelect CHAMADO com quarto:", room);
    console.log('🛒 Quarto selecionado:', room?.number);
    if (room) {
      selectLocalRoom(room);
      scrollToFormWithDelay(300);
    }
  }, [selectLocalRoom, scrollToFormWithDelay]);

  const handleDetailsRoom = useCallback((room) => {
    console.log('🔍 Ver detalhes do quarto:', room?.number);
    setSelectedRoomForDetails(room);
    setIsModalOpen(true);
  }, []);

  const handleReservationSubmit = useCallback(async (reservationData) => {
    try {
      // Salvar no CartContext
      selectRoom(
        {
          id: reservationData.roomId,
          room_number: reservationData.roomNumber,
          type: reservationData.roomType,
          price_per_night: reservationData.pricePerNight
        },
        new Date(reservationData.checkIn),
        new Date(reservationData.checkOut),
        reservationData.guests
      );

      await new Promise(resolve => setTimeout(resolve, 800));
      notifySuccess('Reserva processada com sucesso!');

      if (clearSelectedServices) clearSelectedServices();

      // Navegar para checkout (sem state)
      navigate('/checkout');

    } catch (error) {
      console.error('❌ Erro:', error);
      notifyError('Erro ao processar reserva.');
    }
  }, [selectRoom, navigate, notifySuccess, notifyError, clearSelectedServices]);

  const handleServiceToggle = useCallback((serviceId) => {
    if (toggleService) toggleService(serviceId);
  }, [toggleService]);

  return (
    <div className="home-page">
      <Header transparent={true} />

      <main className="home-page__main">
        <Hero
          onCtaClick={scrollToForm}
          size="small"
          parallax={true}
          title="Hotel Paradise"
          subtitle="Descubra o espaço perfeito para relaxar e criar memórias inesquecíveis"
          ctaText="Reservar Agora"
        />

        <RoomsSection
          onSelectRoom={handleRoomSelect}
          onDetailsRoom={handleDetailsRoom}
          title="Nossos Quartos"
          subtitle="Explore nossos quartos e serviços exclusivos, projetados para oferecer conforto, serenidade e bem-estar durante toda a sua estadia."
        />

        <section
          id="reservation"
          className="home-page__section home-page__section--highlight"
          ref={formRef}
        >
          <div className="container">
            <h2 className="section-title">Faça sua Reserva</h2>

            <div className="reservation-layout">
              <div className="reservation-form-wrapper">
                <ReservationForm
                  selectedRoom={selectedRoom}
                  onSubmit={handleReservationSubmit}
                  selectedServices={selectedServicesDetails || []}
                />
              </div>
            </div>
          </div>
        </section>

        <ServicesSection
          onServiceToggle={handleServiceToggle}
          selectedServiceIds={selectedServices || []}
          title="Serviços Adicionais"
          subtitle="Personalize sua estadia"
        />
      </main>

      <Footer
        companyName="Hotel Paradise"
        showNewsletter={true}
      />

      <RoomDetailsModal
        room={selectedRoomForDetails}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default HomePage;


