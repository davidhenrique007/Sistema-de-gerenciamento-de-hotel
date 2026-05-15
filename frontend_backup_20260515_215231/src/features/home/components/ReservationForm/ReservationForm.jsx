import React, { useState } from 'react';
import { useI18n } from '../../../../contexts/I18nContext';
import PropTypes from 'prop-types';
import { addDays, differenceInDays } from 'date-fns';
import Button from '../../../../shared/components/ui/Button';
import DatePicker from './DatePicker';
import GuestSelector from './GuestSelector';
import PriceSummary from './PriceSummary';
import styles from './ReservationForm.module.css';

const ReservationForm = ({ selectedRoom, onSubmit, selectedServices = [] }) => {
  const { t } = useI18n();
  const [checkIn, setCheckIn] = useState(addDays(new Date(), 1));
  const [checkOut, setCheckOut] = useState(addDays(new Date(), 2));
  const [guests, setGuests] = useState({ adults: 2, children: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const nights = differenceInDays(checkOut, checkIn);
    const roomPrice = selectedRoom?.price?.amount || 0;
    const servicesTotal = (selectedServices || []).reduce((sum, s) => sum + (s.price || 0), 0);
    const totalPrice = (roomPrice * nights) + servicesTotal;
    
    const reservationData = {
      roomId: selectedRoom?.id,
      roomNumber: selectedRoom?.number,
      roomType: selectedRoom?.type,
      pricePerNight: roomPrice,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      services: selectedServices
    };
    
    await onSubmit(reservationData);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formRow}>
        <DatePicker
          label={t('reservation.checkin')}
          selectedDate={checkIn}
          onChange={setCheckIn}
          minDate={new Date()}
        />
        
        <DatePicker
          label={t('reservation.checkout')}
          selectedDate={checkOut}
          onChange={setCheckOut}
          minDate={addDays(checkIn, 1)}
        />
        
        <GuestSelector
          label={t('reservation.guests')}
          guests={guests}
          onChange={setGuests}
        />
      </div>
      
      {selectedRoom && (
        <PriceSummary
          checkIn={checkIn}
          checkOut={checkOut}
          room={selectedRoom}
          services={selectedServices}
        />
      )}
      
      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className={styles.submitButton}
      >
        {t('reservation.search')}
      </Button>
    </form>
  );
};

ReservationForm.propTypes = {
  selectedRoom: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  selectedServices: PropTypes.array
};

ReservationForm.defaultProps = {
  selectedRoom: null,
  selectedServices: []
};

export default ReservationForm;
