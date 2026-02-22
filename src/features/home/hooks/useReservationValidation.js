// ============================================
// HOOK: useReservationValidation
// ============================================
// Responsabilidade: Validações estruturais da reserva
// Desacoplado da UI, apenas lógica de consistência
// ============================================

import { useState, useMemo, useCallback, useEffect } from 'react';

// ============================================
// CONSTANTES
// ============================================

const MIN_NIGHTS = 1;
const MAX_NIGHTS = 30;
const MIN_GUESTS = 1;
const MAX_ADVANCE_DAYS = 365; // 1 ano de antecedência

// ============================================
// HOOK PRINCIPAL
// ============================================

export const useReservationValidation = ({
  // Dados da reserva
  room,
  checkIn,
  checkOut,
  guests,
  selectedServices = [],
  
  // Configurações
  validateAvailability = true,
  validateCapacity = true,
  validateDates = true,
  validateServices = true,
  
  // Dependências externas
  checkAvailability,
  
  // Opções
  minNights = MIN_NIGHTS,
  maxNights = MAX_NIGHTS,
  maxAdvanceDays = MAX_ADVANCE_DAYS,
  
  // Callbacks
  onValidationChange
} = {}) => {
  // ========================================
  // ESTADOS
  // ========================================
  
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);

  // ========================================
  // VALIDAÇÕES ESTRUTURAIS
  // ========================================
  
  const roomValidation = useMemo(() => {
    if (!validateDates) return { isValid: true };
    
    if (!room) {
      return {
        isValid: false,
        code: 'ROOM_REQUIRED',
        message: 'Selecione um quarto para continuar'
      };
    }
    
    return { isValid: true };
  }, [room, validateDates]);

  const datesValidation = useMemo(() => {
    if (!validateDates) return { isValid: true };
    
    if (!checkIn) {
      return {
        isValid: false,
        code: 'CHECKIN_REQUIRED',
        message: 'Selecione a data de check-in'
      };
    }
    
    if (!checkOut) {
      return {
        isValid: false,
        code: 'CHECKOUT_REQUIRED',
        message: 'Selecione a data de check-out'
      };
    }
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Validar data mínima
    if (start < today) {
      return {
        isValid: false,
        code: 'PAST_DATE',
        message: 'A data de check-in não pode ser no passado'
      };
    }
    
    // Validar ordem das datas
    if (end <= start) {
      return {
        isValid: false,
        code: 'INVALID_ORDER',
        message: 'A data de check-out deve ser após o check-in'
      };
    }
    
    // Validar antecedência máxima
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + maxAdvanceDays);
    
    if (start > maxDate) {
      return {
        isValid: false,
        code: 'TOO_FAR_IN_ADVANCE',
        message: `Máximo de ${maxAdvanceDays} dias de antecedência`
      };
    }
    
    return { isValid: true };
  }, [checkIn, checkOut, validateDates, maxAdvanceDays]);

  const nightsValidation = useMemo(() => {
    if (!checkIn || !checkOut) return { isValid: true };
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (nights < minNights) {
      return {
        isValid: false,
        code: 'MIN_NIGHTS',
        message: `Mínimo de ${minNights} ${minNights === 1 ? 'noite' : 'noites'}`
      };
    }
    
    if (nights > maxNights) {
      return {
        isValid: false,
        code: 'MAX_NIGHTS',
        message: `Máximo de ${maxNights} noites`
      };
    }
    
    return { isValid: true };
  }, [checkIn, checkOut, minNights, maxNights]);

  const capacityValidation = useMemo(() => {
    if (!validateCapacity) return { isValid: true };
    
    if (!guests || guests < MIN_GUESTS) {
      return {
        isValid: false,
        code: 'INVALID_GUESTS',
        message: 'Número de hóspedes inválido'
      };
    }
    
    if (room && guests > room.capacity) {
      return {
        isValid: false,
        code: 'CAPACITY_EXCEEDED',
        message: `Este quarto comporta no máximo ${room.capacity} ${room.capacity === 1 ? 'hóspede' : 'hóspedes'}`
      };
    }
    
    return { isValid: true };
  }, [room, guests, validateCapacity]);

  const servicesValidation = useMemo(() => {
    if (!validateServices) return { isValid: true };
    
    // Validações específicas de serviços podem ser adicionadas
    // Por exemplo: limite máximo de serviços, compatibilidade, etc.
    
    return { isValid: true };
  }, [selectedServices, validateServices]);

  // ========================================
  // VALIDAÇÃO DE DISPONIBILIDADE
  // ========================================
  
  const checkRoomAvailability = useCallback(async () => {
    if (!checkAvailability || !room || !checkIn || !checkOut || !guests) {
      return null;
    }
    
    setIsCheckingAvailability(true);
    setAvailabilityError(null);
    
    try {
      const result = await checkAvailability({
        roomId: room.id,
        checkIn,
        checkOut,
        guests
      });
      
      setAvailabilityResult(result);
      return result;
    } catch (error) {
      setAvailabilityError({
        code: error.code || 'AVAILABILITY_CHECK_FAILED',
        message: error.message || 'Erro ao verificar disponibilidade'
      });
      return null;
    } finally {
      setIsCheckingAvailability(false);
    }
  }, [room, checkIn, checkOut, guests, checkAvailability]);

  // Verificar disponibilidade automaticamente quando dados mudarem
  useEffect(() => {
    if (validateAvailability && room && checkIn && checkOut && guests) {
      checkRoomAvailability();
    } else {
      setAvailabilityResult(null);
    }
  }, [room, checkIn, checkOut, guests, validateAvailability, checkRoomAvailability]);

  // ========================================
  // ESTADO CONSOLIDADO DE VALIDAÇÃO
  // ========================================
  
  const allValidations = useMemo(() => ({
    room: roomValidation,
    dates: datesValidation,
    nights: nightsValidation,
    capacity: capacityValidation,
    services: servicesValidation,
    availability: availabilityResult ? {
      isValid: availabilityResult.isAvailable,
      code: availabilityResult.isAvailable ? null : 'UNAVAILABLE',
      message: availabilityResult.reason || 'Quarto não disponível para o período'
    } : null
  }), [roomValidation, datesValidation, nightsValidation, capacityValidation, servicesValidation, availabilityResult]);

  const validationErrors = useMemo(() => {
    const errors = {};
    
    Object.entries(allValidations).forEach(([key, validation]) => {
      if (validation && !validation.isValid) {
        errors[key] = {
          code: validation.code,
          message: validation.message
        };
      }
    });
    
    return errors;
  }, [allValidations]);

  const isValid = useMemo(() => {
    return Object.values(allValidations).every(v => !v || v.isValid);
  }, [allValidations]);

  // Notificar mudanças na validação
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange({
        isValid,
        errors: validationErrors,
        validations: allValidations
      });
    }
  }, [isValid, validationErrors, allValidations, onValidationChange]);

  // ========================================
  // FUNÇÕES DE VALIDAÇÃO MANUAL
  // ========================================
  
  const validateReservation = useCallback(() => {
    return {
      isValid,
      errors: validationErrors,
      validations: allValidations
    };
  }, [isValid, validationErrors, allValidations]);

  const validateField = useCallback((field) => {
    const validation = allValidations[field];
    return {
      isValid: validation?.isValid ?? true,
      error: validation?.isValid ? null : {
        code: validation.code,
        message: validation.message
      }
    };
  }, [allValidations]);

  // ========================================
  // RETORNO
  // ========================================
  
  return {
    // Estado de validação
    isValid,
    validationErrors,
    allValidations,
    
    // Disponibilidade
    availability: availabilityResult,
    isCheckingAvailability,
    availabilityError,
    
    // Funções de validação
    validateReservation,
    validateField,
    checkRoomAvailability,
    
    // Utilitários
    hasErrors: Object.keys(validationErrors).length > 0,
    isReady: isValid && (!validateAvailability || (availabilityResult?.isAvailable === true))
  };
};