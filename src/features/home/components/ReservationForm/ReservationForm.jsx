// ============================================
// COMPONENT: ReservationForm
// ============================================
// Responsabilidade: Formulário de reserva com DatePicker refatorado
// Integração: Design System, acessibilidade, cálculo de preços
// ============================================

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);
  const [nights, setNights] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [internalPriceBreakdown, setInternalPriceBreakdown] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({
    checkIn: false,
    checkOut: false,
    guests: false
  });

  // Refs para controle de montagem e debounce
  const isMounted = useRef(true);
  const calculateTimeout = useRef(null);

  // Usar breakdown externo se fornecido, senão usar interno
  const priceBreakdown = externalPriceBreakdown || internalPriceBreakdown;

  // ========================================
  // EFEITOS DE MONTAGEM/DESMONTAGEM
  // ========================================

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (calculateTimeout.current) {
        clearTimeout(calculateTimeout.current);
      }
    };
  }, []);

  // ========================================
  // INTEGRAÇÃO COM HOOK DE RESERVA
  // ========================================

  useEffect(() => {
    if (reservationHook && isMounted.current) {
      // Sincronizar datas com o hook apenas se houver mudanças significativas
      if (reservationHook.checkIn !== checkIn) {
        reservationHook.setDates(checkIn, checkOut);
      }

      // Sincronizar número de hóspedes
      if (reservationHook.guests !== guests) {
        reservationHook.setGuests(guests);
      }
    }
  }, [checkIn, checkOut, guests, reservationHook]);

  // ========================================
  // VALIDAÇÕES COM useMemo
  // ========================================

  const validationErrors = useMemo(() => {
    const errors = {};

    if (!selectedRoom) return errors;

    // Validação de check-in
    if (touched.checkIn && !checkIn) {
      errors.checkIn = 'Data de check-in é obrigatória';
    }

    // Validação de check-out
    if (touched.checkOut && !checkOut) {
      errors.checkOut = 'Data de check-out é obrigatória';
    }

    // Validação de datas combinadas
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (checkOutDate <= checkInDate) {
        errors.checkOut = 'Check-out deve ser após o check-in';
      }
    }

    // Validação de noites mínimas/máximas
    if (nights > 0) {
      if (nights < minNights) {
        errors.nights = `Mínimo de ${minNights} ${minNights === 1 ? 'noite' : 'noites'}`;
      } else if (nights > maxNights) {
        errors.nights = `Máximo de ${maxNights} noites`;
      }
    }

    // Validação de capacidade do quarto
    if (touched.guests && selectedRoom && guests > selectedRoom.capacity) {
      errors.guests = `Máximo de ${selectedRoom.capacity} ${selectedRoom.capacity === 1 ? 'hóspede' : 'hóspedes'}`;
    }

    return errors;
  }, [checkIn, checkOut, guests, nights, selectedRoom, touched, minNights, maxNights]);

  // Atualizar formErrors com as validações
  useEffect(() => {
    setFormErrors(validationErrors);
  }, [validationErrors]);

  // ========================================
  // CÁLCULO DE PREÇOS COM DEBOUNCE
  // ========================================

  const calculatePrice = useCallback(async () => {
    // Limpar timeout anterior
    if (calculateTimeout.current) {
      clearTimeout(calculateTimeout.current);
    }

    // Validar se temos dados suficientes
    if (!selectedRoom || !checkIn || !checkOut || !guests || nights === 0) {
      setInternalPriceBreakdown(null);
      return;
    }

    // Verificar se há erros de validação
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsCalculating(true);

    try {
      let breakdown;

      if (calculatePriceUseCase) {
        // Usar o use case injetado com debounce
        calculateTimeout.current = setTimeout(async () => {
          if (!isMounted.current) return;

          try {
            breakdown = await calculatePriceUseCase.execute({
              roomId: selectedRoom.id,
              checkIn: checkIn.toISOString ? checkIn.toISOString() : checkIn,
              checkOut: checkOut.toISOString ? checkOut.toISOString() : checkOut,
              guestsCount: guests,
              serviceIds: reservationHook?.selectedServices || []
            });

            if (isMounted.current) {
              setInternalPriceBreakdown(breakdown);
            }
          } catch (error) {
            console.error('Erro ao calcular preço:', error);
            if (isMounted.current) {
              setFormErrors((prev) => ({
                ...prev,
                calculate: 'Erro ao calcular preço. Tente novamente.'
              }));
            }
          } finally {
            if (isMounted.current) {
              setIsCalculating(false);
            }
          }
        }, 500); // 500ms debounce
      } else {
        // Fallback para cálculo local (apenas para desenvolvimento)
        const roomPrice = selectedRoom.pricePerNight?.amount || selectedRoom.pricePerNight || 0;
        const roomTotal = roomPrice * nights;

        breakdown = {
          roomId: selectedRoom.id,
          roomNumber: selectedRoom.number,
          nights,
          guestsCount: guests,
          roomPrice: {
            subtotal: roomTotal,
            currency: selectedRoom.pricePerNight?.currency || 'MZN'
          },
          services: [],
          taxes: { total: 0 },
          total: { amount: roomTotal }
        };

        setInternalPriceBreakdown(breakdown);
        setIsCalculating(false);
      }
    } catch (error) {
      console.error('Erro ao calcular preço:', error);
      if (isMounted.current) {
        setFormErrors((prev) => ({
          ...prev,
          calculate: 'Erro ao calcular preço. Tente novamente.'
        }));
        setIsCalculating(false);
      }
    }
  }, [
    selectedRoom,
    checkIn,
    checkOut,
    guests,
    nights,
    calculatePriceUseCase,
    reservationHook,
    validationErrors
  ]);

  // Efeito para recalcular quando dados mudarem
  useEffect(() => {
    calculatePrice();

    return () => {
      if (calculateTimeout.current) {
        clearTimeout(calculateTimeout.current);
      }
    };
  }, [calculatePrice, checkIn, checkOut, guests, selectedRoom, reservationHook?.selectedServices]);

  // ========================================
  // HANDLERS
  // ========================================

  const handleDateChange = useCallback(
    (date) => {
      // O DatePicker agora retorna uma única data
      // Precisamos gerenciar check-in e check-out separadamente
      if (!checkIn) {
        // Primeira seleção = check-in
        setCheckIn(date);
        setTouched((prev) => ({ ...prev, checkIn: true }));
      } else if (!checkOut && date > checkIn) {
        // Segunda seleção = check-out (se for após check-in)
        setCheckOut(date);
        setNights(Math.ceil((date - checkIn) / (1000 * 60 * 60 * 24)));
        setTouched((prev) => ({ ...prev, checkOut: true }));
      } else {
        // Reiniciar seleção
        setCheckIn(date);
        setCheckOut(null);
        setNights(0);
        setTouched((prev) => ({ ...prev, checkIn: true, checkOut: false }));
      }
    },
    [checkIn, checkOut]
  );

  const handleGuestsChange = useCallback((value) => {
    setGuests(value);
    setTouched((prev) => ({ ...prev, guests: true }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Marcar todos os campos como tocados
      setTouched({
        checkIn: true,
        checkOut: true,
        guests: true
      });

      // Validar antes de submeter
      if (Object.keys(validationErrors).length > 0) {
        return;
      }

      if (!selectedRoom || !checkIn || !checkOut || guests < 1) {
        return;
      }

      if (onSubmit) {
        await onSubmit({
          roomId: selectedRoom?.id,
          checkIn: checkIn.toISOString ? checkIn.toISOString() : checkIn,
          checkOut: checkOut.toISOString ? checkOut.toISOString() : checkOut,
          guests,
          nights,
          totalPrice: priceBreakdown?.total?.amount || 0,
          priceBreakdown
        });
      }
    },
    [selectedRoom, checkIn, checkOut, guests, nights, priceBreakdown, onSubmit, validationErrors]
  );

  // ========================================
  // FUNÇÕES AUXILIARES
  // ========================================

  const getMinDate = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);

  const getMaxDate = useCallback(() => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 365); // Máximo 1 ano
    return maxDate;
  }, []);

  // ========================================
  // CLASSES CSS
  // ========================================

  const formClasses = [styles.form, !selectedRoom && styles.disabled, className]
    .filter(Boolean)
    .join(' ');

  /// ========================================
  // RENDER
  // ========================================

  const hasErrors = Object.keys(formErrors).length > 0;
  const canSubmit =
    selectedRoom &&
    checkIn &&
    checkOut &&
    guests > 0 &&
    !hasErrors &&
    !isCalculating &&
    !isSubmitting;

  // ✅ LOG PARA DEBUG DO DATEPICKER
  console.log('📅 [ReservationForm] DatePicker props:', {
    value: checkIn || checkOut,
    checkIn,
    checkOut,
    disabled: !selectedRoom || isSubmitting,
    error:
      touched.checkIn && formErrors.checkIn
        ? formErrors.checkIn
        : touched.checkOut && formErrors.checkOut
          ? formErrors.checkOut
          : '',
    minDate: getMinDate(),
    maxDate: getMaxDate(),
    selectedRoom: !!selectedRoom
  });

  return (
    <form
      className={formClasses}
      onSubmit={handleSubmit}
      noValidate
      aria-label="Formulário de reserva"
      {...props}
    >
      <h2 className={styles.formTitle}>Faça sua Reserva</h2>

      {/* Seleção de datas com novo DatePicker */}
      <div className={styles.formGroup}>
        <DatePicker
          value={checkIn || checkOut}
          onChange={handleDateChange}
          error={
            touched.checkIn && formErrors.checkIn
              ? formErrors.checkIn
              : touched.checkOut && formErrors.checkOut
                ? formErrors.checkOut
                : ''
          }
          minDate={getMinDate()}
          maxDate={getMaxDate()}
          disabled={!selectedRoom || isSubmitting}
          label="Data de check-in / check-out"
          required
        />

        {/* Instrução visual para seleção de datas */}
        {selectedRoom && !checkIn && (
          <p className={styles.dateHint}>Selecione a data de check-in</p>
        )}
        {checkIn && !checkOut && <p className={styles.dateHint}>Selecione a data de check-out</p>}
        {checkIn && checkOut && (
          <p className={styles.dateRange}>
            {checkIn.toLocaleDateString('pt-BR')} → {checkOut.toLocaleDateString('pt-BR')}
            <span className={styles.nightsBadge}>
              {nights} {nights === 1 ? 'noite' : 'noites'}
            </span>
          </p>
        )}
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
          error={touched.guests && formErrors.guests}
        />
      </div>

      {/* Resumo de preços */}
      {selectedRoom && checkIn && checkOut && !hasErrors && (
        <div className={styles.formGroup}>
          <PriceSummary breakdown={priceBreakdown} isLoading={isCalculating} aria-live="polite" />
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

      {/* Mensagens de erro consolidadas */}
      {hasErrors && (
        <div className={styles.errorSummary} role="alert">
          <p className={styles.errorSummaryTitle}>Por favor, corrija os seguintes erros:</p>
          <ul className={styles.errorList}>
            {formErrors.checkIn && <li>• {formErrors.checkIn}</li>}
            {formErrors.checkOut && <li>• {formErrors.checkOut}</li>}
            {formErrors.guests && <li>• {formErrors.guests}</li>}
            {formErrors.nights && <li>• {formErrors.nights}</li>}
          </ul>
        </div>
      )}
    </form>
  );
};

ReservationForm.displayName = 'ReservationForm';
