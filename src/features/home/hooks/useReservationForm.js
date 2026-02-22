// ============================================
// HOOK: useReservationForm
// ============================================
// Responsabilidade: Gerenciar lógica e validação do formulário de reserva
// Separa validação da UI e controla habilitação de pagamento
// ============================================

import { useState, useEffect, useMemo, useCallback } from 'react';

// ============================================
// CONSTANTES
// ============================================

const MIN_NIGHTS = 1;
const MAX_NIGHTS = 30;
const MIN_GUESTS = 1;

// ============================================
// HOOK PRINCIPAL
// ============================================

export const useReservationForm = ({
  // Dependências externas
  reservationState,
  onValidSubmit,
  
  // Configurações
  validateOnChange = true,
  requireRoomSelection = true,
  requireDates = true,
  minNights = MIN_NIGHTS,
  maxNights = MAX_NIGHTS,
  
  // Callbacks
  onValidationChange,
  onError
} = {}) => {
  // ========================================
  // ESTADO DO FORMULÁRIO
  // ========================================
  
  const [touched, setTouched] = useState({
    room: false,
    checkIn: false,
    checkOut: false,
    guests: false,
    services: false
  });
  
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ========================================
  // VALIDAÇÕES
  // ========================================
  
  const validateRoom = useCallback(() => {
    if (!requireRoomSelection) return { isValid: true };
    
    if (!reservationState.room) {
      return {
        isValid: false,
        message: 'Selecione um quarto para continuar'
      };
    }
    
    return { isValid: true };
  }, [reservationState.room, requireRoomSelection]);

  const validateDates = useCallback(() => {
    if (!requireDates) return { isValid: true };
    
    const { checkIn, checkOut } = reservationState;
    
    if (!checkIn) {
      return {
        isValid: false,
        message: 'Selecione a data de check-in'
      };
    }
    
    if (!checkOut) {
      return {
        isValid: false,
        message: 'Selecione a data de check-out'
      };
    }
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (start < today) {
      return {
        isValid: false,
        message: 'A data de check-in não pode ser no passado'
      };
    }
    
    if (end <= start) {
      return {
        isValid: false,
        message: 'A data de check-out deve ser após o check-in'
      };
    }
    
    const nights = reservationState.nights;
    
    if (nights < minNights) {
      return {
        isValid: false,
        message: `Mínimo de ${minNights} ${minNights === 1 ? 'noite' : 'noites'}`
      };
    }
    
    if (nights > maxNights) {
      return {
        isValid: false,
        message: `Máximo de ${maxNights} noites`
      };
    }
    
    return { isValid: true };
  }, [reservationState.checkIn, reservationState.checkOut, reservationState.nights, requireDates, minNights, maxNights]);

  const validateGuests = useCallback(() => {
    const { guests, room } = reservationState;
    
    if (!guests || guests < MIN_GUESTS) {
      return {
        isValid: false,
        message: 'Número de hóspedes inválido'
      };
    }
    
    if (room && guests > room.capacity) {
      return {
        isValid: false,
        message: `Este quarto comporta no máximo ${room.capacity} ${room.capacity === 1 ? 'hóspede' : 'hóspedes'}`
      };
    }
    
    return { isValid: true };
  }, [reservationState.guests, reservationState.room]);

  const validateServices = useCallback(() => {
    // Validações específicas de serviços podem ser adicionadas aqui
    return { isValid: true };
  }, []);

  // ========================================
  // ESTADO DE VALIDAÇÃO CONSOLIDADO
  // ========================================
  
  const validations = useMemo(() => ({
    room: validateRoom(),
    dates: validateDates(),
    guests: validateGuests(),
    services: validateServices()
  }), [validateRoom, validateDates, validateGuests, validateServices]);

  const errors = useMemo(() => {
    const errorList = {};
    
    Object.entries(validations).forEach(([field, validation]) => {
      if (!validation.isValid && (touched[field] || submitAttempted)) {
        errorList[field] = validation.message;
      }
    });
    
    return errorList;
  }, [validations, touched, submitAttempted]);

  const isValid = useMemo(() => {
    return Object.values(validations).every(v => v.isValid);
  }, [validations]);

  const canProceedToPayment = useMemo(() => {
    // Condições mínimas para habilitar pagamento
    return isValid && reservationState.hasRoom && reservationState.hasDates && reservationState.nights > 0;
  }, [isValid, reservationState.hasRoom, reservationState.hasDates, reservationState.nights]);

  // ========================================
  // HANDLERS DE TOUCH
  // ========================================
  
  const touchField = useCallback((field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  }, []);

  const touchAll = useCallback(() => {
    setTouched({
      room: true,
      checkIn: true,
      checkOut: true,
      guests: true,
      services: true
    });
  }, []);

  const resetTouched = useCallback(() => {
    setTouched({
      room: false,
      checkIn: false,
      checkOut: false,
      guests: false,
      services: false
    });
    setSubmitAttempted(false);
  }, []);

  // ========================================
  // SUBMISSÃO
  // ========================================
  
  const handleSubmit = useCallback(async (event) => {
    if (event) {
      event.preventDefault();
    }
    
    setSubmitAttempted(true);
    touchAll();
    
    if (!isValid) {
      if (onError) {
        onError(errors);
      }
      return false;
    }
    
    setIsSubmitting(true);
    
    try {
      if (onValidSubmit) {
        await onValidSubmit(reservationState);
      }
      return true;
    } catch (error) {
      if (onError) {
        onError({ submit: error.message });
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isValid, errors, reservationState, onValidSubmit, onError, touchAll]);

  // ========================================
  // EFEITOS
  // ========================================
  
  useEffect(() => {
    if (validateOnChange && onValidationChange) {
      onValidationChange({
        isValid,
        errors,
        canProceedToPayment
      });
    }
  }, [isValid, errors, canProceedToPayment, validateOnChange, onValidationChange]);

  // ========================================
  // RETORNO
  // ========================================
  
  return {
    // Estado
    touched,
    submitAttempted,
    isSubmitting,
    
    // Validações
    validations,
    errors,
    isValid,
    canProceedToPayment,
    
    // Ações de touch
    touchField,
    touchAll,
    resetTouched,
    
    // Submissão
    handleSubmit,
    
    // Utilitários
    getFieldError: (field) => errors[field],
    isFieldInvalid: (field) => !!(touched[field] && errors[field]),
    isFieldValid: (field) => !!(touched[field] && !errors[field])
  };
};