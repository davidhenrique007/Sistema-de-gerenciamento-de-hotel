// ============================================
// COMPONENT: ReservationForm
// ============================================
// Responsabilidade: Formulário de reserva integrado com calculatePriceUseCase
// ============================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, ButtonSize } from '../../../../shared/components/ui';
import { DatePicker } from './DatePicker.jsx';
import { GuestSelector } from './GuestSelector.jsx';
import { PriceSummary } from '../Summary/PriceSummary.jsx';
import styles from './ReservationForm.module.css';

export const ReservationForm = ({
  // Dados do quarto selecionado
  selectedRoom = null,
  
  // Use cases injetados
  calculatePriceUseCase,
  
  // Callbacks
  onSubmit,
  
  // Estados
  isSubmitting = false,
  priceBreakdown: externalPriceBreakdown,
  
  // Hook de reserva (para integração)
  reservationHook,
  
  // Configurações
  minNights = 1,
  maxNights = 30,
  
  // Classes
  className = '',
  ...props
}) => {
  // ========================================
  // ESTADOS
  // ========================================
  
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [nights, setNights] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [internalPriceBreakdown, setInternalPriceBreakdown] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Usar breakdown externo se fornecido, senão usar interno
  const priceBreakdown = externalPriceBreakdown || internalPriceBreakdown;

  // ========================================
  // INTEGRAÇÃO COM HOOK DE RESERVA
  // ========================================
  
  useEffect(() => {
    if (reservationHook) {
      // Sincronizar datas com o hook
      if (checkIn !== reservationHook.checkIn) {
        reservationHook.setDates(checkIn, checkOut);
      }
      
      // Sincronizar número de hóspedes
      if (guests !== reservationHook.guests) {
        reservationHook.setGuests(guests);
      }
    }
  }, [checkIn, checkOut, guests, reservationHook]);

  // ========================================
  // VALIDAÇÕES
  // ========================================
  
  const validateForm = useCallback(() => {
    const errors = {};

    if (!checkIn) {
      errors.checkIn = 'Data de check-in é obrigatória';
    }

    if (!checkOut) {
      errors.checkOut = 'Data de check-out é obrigatória';
    }

    if (selectedRoom && guests > selectedRoom.capacity) {
      errors.guests = `Máximo de ${selectedRoom.capacity} hóspedes neste quarto`;
    }

    if (nights < minNights) {
      errors.nights = `Mínimo de ${minNights} ${minNights === 1 ? 'noite' : 'noites'}`;
    }

    if (nights > maxNights) {
      errors.nights = `Máximo de ${maxNights} noites`;
    }

    return errors;
  }, [checkIn, checkOut, guests, nights, selectedRoom, minNights, maxNights]);

  // ========================================
  // CÁLCULO DE PREÇOS VIA USE CASE
  // ========================================
  
  const calculatePrice = useCallback(async () => {
    if (!selectedRoom || !checkIn || !checkOut || !guests || nights === 0) {
      setInternalPriceBreakdown(null);
      return;
    }

    setIsCalculating(true);
    
    try {
      let breakdown;
      
      if (calculatePriceUseCase) {
        // Usar o use case injetado
        breakdown = await calculatePriceUseCase.execute({
          roomId: selectedRoom.id,
          checkIn,
          checkOut,
          guestsCount: guests,
          serviceIds: reservationHook?.selectedServices || []
        });
      } else {
        // Fallback para cálculo local (apenas para desenvolvimento)
        const roomTotal = selectedRoom.pricePerNight * nights;
        breakdown = {
          roomId: selectedRoom.id,
          roomNumber: selectedRoom.number,
          nights,
          guestsCount: guests,
          roomPrice: { subtotal: roomTotal },
          services: [],
          taxes: { total: 0 },
          total: { amount: roomTotal }
        };
      }
      
      setInternalPriceBreakdown(breakdown);
    } catch (error) {
      console.error('Erro ao calcular preço:', error);
      setFormErrors(prev => ({
        ...prev,
        calculate: 'Erro ao calcular preço. Tente novamente.'
      }));
    } finally {
      setIsCalculating(false);
    }
  }, [selectedRoom, checkIn, checkOut, guests, nights, calculatePriceUseCase, reservationHook]);

  // Efeito para recalcular quando dados mudarem
  useEffect(() => {
    const timer = setTimeout(() => {
      calculatePrice();
    }, 300); // Debounce para evitar múltiplas chamadas

    return () => clearTimeout(timer);
  }, [calculatePrice, checkIn, checkOut, guests, selectedRoom, reservationHook?.selectedServices]);

  // ========================================
  // HANDLERS
  // ========================================
  
  const handleDateChange = useCallback(({ checkIn, checkOut, nights }) => {
    setCheckIn(checkIn);
    setCheckOut(checkOut);
    setNights(nights);
    setTouched(prev => ({ ...prev, dates: true }));
  }, []);

  const handleGuestsChange = useCallback((value) => {
    setGuests(value);
    setTouched(prev => ({ ...prev, guests: true }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    setTouched({
      dates: true,
      guests: true
    });

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (onSubmit) {
      await onSubmit({
        roomId: selectedRoom?.id,
        checkIn,
        checkOut,
        guests,
        nights,
        totalPrice: priceBreakdown?.total?.amount
      });
    }
  }, [selectedRoom, checkIn, checkOut, guests, nights, priceBreakdown, onSubmit, validateForm]);

  // ========================================
  // CLASSES CSS
  // ========================================
  
  const formClasses = [
    styles.form,
    !selectedRoom && styles.disabled,
    className
  ].filter(Boolean).join(' ');

  // ========================================
  // RENDER
  // ========================================
  
  const hasErrors = Object.keys(formErrors).length > 0;
  const canSubmit = selectedRoom && !hasErrors && !isCalculating && !isSubmitting;

  return (
    <form 
      className={formClasses}
      onSubmit={handleSubmit}
      noValidate
      {...props}
    >
      <h2 className={styles.formTitle}>Faça sua Reserva</h2>

      {/* Seleção de datas */}
      <div className={styles.formGroup}>
        <DatePicker
          checkIn={checkIn}
          checkOut={checkOut}
          onChange={handleDateChange}
          disabled={!selectedRoom || isSubmitting}
        />
      </div>

      {/* Seleção de hóspedes */}
      <div className={styles.formGroup}>
        <GuestSelector
          value={guests}
          onChange={handleGuestsChange}
          min={1}
          max={selectedRoom?.capacity || 10}
          maxPerRoom={selectedRoom?.capacity}
          disabled={!selectedRoom || isSubmitting}
          label="Número de hóspedes"
        />
      </div>

      {/* Resumo de preços */}
      {selectedRoom && (
        <div className={styles.formGroup}>
          <PriceSummary
            breakdown={priceBreakdown}
            isLoading={isCalculating}
            aria-live="polite"
          />
        </div>
      )}

      {/* Botão de submit */}
      <div className={styles.formActions}>
        <Button
          type="submit"
          size={ButtonSize.LARGE}
          fullWidth
          disabled={!canSubmit}
          loading={isSubmitting}
        >
          {isSubmitting ? 'Processando...' : 'Reservar Agora'}
        </Button>
      </div>

      {/* Mensagens de erro */}
      {touched.dates && (formErrors.checkIn || formErrors.checkOut) && (
        <div className={styles.formError} role="alert">
          Selecione datas válidas para check-in e check-out
        </div>
      )}

      {touched.guests && formErrors.guests && (
        <div className={styles.formError} role="alert">
          {formErrors.guests}
        </div>
      )}
    </form>
  );
};