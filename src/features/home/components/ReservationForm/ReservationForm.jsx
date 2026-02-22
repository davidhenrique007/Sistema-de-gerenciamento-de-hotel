// ============================================
// COMPONENT: ReservationForm
// ============================================
// Responsabilidade: Formulário principal de reserva
// Integração: DatePicker, GuestSelector, PriceSummary
// ============================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, ButtonSize } from '../../../../shared/components/ui';
import { DatePicker } from './DatePicker.js';
import { GuestSelector } from './GuestSelector.js';
import { PriceSummary } from '../Summary/PriceSummary.js';
import styles from './ReservationForm.module.css';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const ReservationForm = ({
  // Dados do quarto selecionado
  selectedRoom = null,
  
  // Callbacks
  onCalculatePrice,
  onSubmit,
  
  // Estados
  isCalculating = false,
  isSubmitting = false,
  priceBreakdown = null,
  
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
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

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
  // EFFECTS
  // ========================================
  
  useEffect(() => {
    const errors = validateForm();
    setFormErrors(errors);
  }, [validateForm]);

  // Calcular preço automaticamente quando dados mudam
  useEffect(() => {
    if (selectedRoom && checkIn && checkOut && guests && Object.keys(formErrors).length === 0) {
      onCalculatePrice?.({
        roomId: selectedRoom.id,
        checkIn,
        checkOut,
        guests,
        nights
      });
    }
  }, [selectedRoom, checkIn, checkOut, guests, nights, formErrors, onCalculatePrice]);

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
    
    // Marcar todos os campos como tocados
    setTouched({
      dates: true,
      guests: true
    });

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      return;
    }

    if (onSubmit) {
      await onSubmit({
        roomId: selectedRoom?.id,
        checkIn,
        checkOut,
        guests,
        nights,
        totalPrice: priceBreakdown?.total
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
          error={touched.dates ? formErrors : {}}
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
      {selectedRoom && priceBreakdown && (
        <div className={styles.formGroup}>
          <PriceSummary
            breakdown={priceBreakdown}
            isLoading={isCalculating}
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

ReservationForm.displayName = 'ReservationForm';