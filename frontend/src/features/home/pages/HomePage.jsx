import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../../contexts/I18nContext';
import Header from '../components/Header';
import Hero from '../components/Hero';
import RoomsSection from '../components/RoomsSection/RoomsSection';
import { ReservationForm } from '../components/ReservationForm';
import MapSection from '../components/MapSection/MapSection';
import HotelCarousel from '../components/HotelCarousel/HotelCarousel';
import Footer from '../components/Footer';
import RoomDetailsModal from '../components/RoomsSection/RoomDetailsModal';
import useRoomSelection from '../hooks/useRoomSelection';
import useScrollToForm from '../hooks/useScrollToForm';
import useServices from '../hooks/useServices';
import useRooms from '../hooks/useRooms';
import useNotification from "../../../shared/components/ui/Notification/useNotification";
import { useCart } from '../../../contexts/CartContext';
import { useCliente } from '../../../contexts/ClienteContext';
import './home.css';

const HomePage = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const cart = useCart();
  const { selectRoom } = cart;
  const { isIdentificado } = useCliente();
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
    console.log('   isIdentificado:', isIdentificado);
  }, [rooms, selectedRoom, isIdentificado]);

  const handleRoomSelect = useCallback((room) => {
    if (room) {
      selectLocalRoom(room);
      scrollToFormWithDelay(300);
    }
  }, [selectLocalRoom, scrollToFormWithDelay]);

  const handleDetailsRoom = useCallback((room) => {
    setSelectedRoomForDetails(room);
    setIsModalOpen(true);
  }, []);

  const handleReservationSubmit = useCallback(async (reservationData) => {
    try {
      console.log('📦 Dados da reserva:', reservationData);
      console.log('📌 isIdentificado:', isIdentificado);
      
      // 1. Salvar no CartContext
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

      // 2. SEMPRE salvar os dados da reserva
      const reservationDataComplete = {
        room: {
          id: reservationData.roomId,
          number: reservationData.roomNumber,
          type: reservationData.roomType,
          price_per_night: reservationData.pricePerNight
        },
        checkIn: reservationData.checkIn,
        checkOut: reservationData.checkOut,
        guests: reservationData.guests,
        services: selectedServicesDetails || []
      };
      
      localStorage.setItem('@HotelParadise:pending_reservation', 'true');
      localStorage.setItem('pending_reservation_data', JSON.stringify(reservationDataComplete));
      
      console.log('✅ Reserva salva no localStorage');
      console.log('✅ Flag pending_reservation:', localStorage.getItem('@HotelParadise:pending_reservation'));

      await new Promise(resolve => setTimeout(resolve, 300));
      notifySuccess(t('common.success'));
      if (clearSelectedServices) clearSelectedServices();

      // 3. 🔥 FORÇAR IR PARA LOGIN SEMPRE (para garantir token válido)
      console.log('🔑 Redirecionando para /login-cliente (para obter token válido)');
      window.location.href = '/login-cliente';

    } catch (error) {
      console.error('❌ Erro:', error);
      notifyError(t('errors.server_error'));
    }
  }, [selectRoom, isIdentificado, notifySuccess, notifyError, clearSelectedServices, t, selectedServicesDetails]);

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
          title={t('hero.title')}
          subtitle={t('hero.subtitle')}
          ctaText={t('hero.cta')}
        />

        <RoomsSection
          onSelectRoom={handleRoomSelect}
          onDetailsRoom={handleDetailsRoom}
          title={t('hero.featured_rooms')}
          subtitle={t('hero.rooms_subtitle') || "Explore nossos quartos e serviços exclusivos"}
        />

        <section
          id="reservation"
          className="home-page__section home-page__section--highlight"
          ref={formRef}
        >
          <div className="container">
            <h2 className="section-title">{t('reservation.title') || "Faça sua Reserva"}</h2>

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

        <MapSection />

        <HotelCarousel />
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
