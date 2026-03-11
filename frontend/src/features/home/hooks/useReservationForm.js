import { useState, useCallback, useMemo, useEffect } from 'react';
import useGuestCounter from './useGuestCounter';
import useDatePicker from './useDatePicker';
import usePriceCalculation from './usePriceCalculation';

/**
 * Hook personalizado para gerenciar estado completo do formulário de reserva
 * 
 * @param {Object} initialData - Dados iniciais da reserva
 * @returns {Object} Estado e funções do formulário
 */
const useReservationForm = (initialData = {}) => {
  // ==========================================================================
  // ESTADO
  // ==========================================================================

  const [selectedRoom, setSelectedRoom] = useState(initialData.selectedRoom || null);
  const [selectedServices, setSelectedServices] = useState(initialData.selectedServices || []);
  const [formTouched, setFormTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==========================================================================
  // HOOKS FILHOS
  // ==========================================================================

  const guestCounter = useGuestCounter(
    initialData.guests || { adults: 1, children: 0, babies: 0 }
  );

  const datePicker = useDatePicker({
    minDate: new Date(),
    ...initialData.datePicker,
  });

  const priceCalculation = usePriceCalculation({
    room: selectedRoom,
    guests: guestCounter.totalGuests,
    nights: datePicker.nights,
    services: selectedServices,
  });

  // ==========================================================================
  // VALIDAÇÕES
  // ==========================================================================

  const isFormValid = useMemo(() => {
    if (!selectedRoom) return false;
    if (!datePicker.checkIn || !datePicker.checkOut) return false;
    if (!datePicker.isValid) return false;
    if (guestCounter.totalGuests === 0) return false;
    if (selectedRoom.capacity < guestCounter.totalGuests) return false;
    
    return true;
  }, [selectedRoom, datePicker, guestCounter.totalGuests]);

  const validationErrors = useMemo(() => {
    const errors = [];

    if (!selectedRoom) {
      errors.push('Selecione um quarto');
    }

    if (!datePicker.checkIn || !datePicker.checkOut) {
      errors.push('Selecione as datas de check-in e check-out');
    } else if (!datePicker.isValid) {
      errors.push('Período de reserva inválido');
    }

    if (selectedRoom && guestCounter.totalGuests > selectedRoom.capacity) {
      errors.push(`Capacidade máxima do quarto é de ${selectedRoom.capacity} hóspedes`);
    }

    return errors;
  }, [selectedRoom, datePicker, guestCounter.totalGuests]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleSelectRoom = useCallback((room) => {
    setSelectedRoom(room);
    setFormTouched(true);
  }, []);

  const handleToggleService = useCallback((serviceId) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
    setFormTouched(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!isFormValid) return;

    setIsSubmitting(true);
    
    try {
      // Simular envio para API
      const reservationData = {
        roomId: selectedRoom?.id,
        checkIn: datePicker.checkIn,
        checkOut: datePicker.checkOut,
        guests: {
          adults: guestCounter.guests.adults,
          children: guestCounter.guests.children,
          babies: guestCounter.guests.babies,
          total: guestCounter.totalGuests,
        },
        services: selectedServices,
        price: priceCalculation,
      };

      console.log('[Reservation] Submitting:', reservationData);
      
      // Aqui seria a chamada real para API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return reservationData;
    } catch (error) {
      console.error('[Reservation] Error:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [isFormValid, selectedRoom, datePicker, guestCounter, selectedServices, priceCalculation]);

  const resetForm = useCallback(() => {
    setSelectedRoom(null);
    setSelectedServices([]);
    guestCounter.resetGuests();
    datePicker.resetDates();
    setFormTouched(false);
  }, [guestCounter, datePicker]);

  // ==========================================================================
  // Sincronizar com props externas
  // ==========================================================================

  useEffect(() => {
    if (initialData.selectedRoom) {
      setSelectedRoom(initialData.selectedRoom);
    }
  }, [initialData.selectedRoom]);

  // ==========================================================================
  // RETORNO
  // ==========================================================================

  return {
    // Estado
    selectedRoom,
    selectedServices,
    isSubmitting,
    formTouched,
    
    // Dados derivados
    isFormValid,
    validationErrors,
    
    // Hooks filhos
    guestCounter,
    datePicker,
    priceCalculation,
    
    // Handlers
    handleSelectRoom,
    handleToggleService,
    handleSubmit,
    resetForm,
    setSelectedServices,
  };
};

export default useReservationForm;