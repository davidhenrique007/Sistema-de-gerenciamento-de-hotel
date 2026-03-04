import { useState, useCallback, useMemo } from 'react';
import {
  getToday,
  isPastDate,
  isValidDateRange,
  calculateNights,
  isDateAvailable,
} from '../../../shared/utils/dateUtils';

/**
 * Hook personalizado para gerenciar seleção de datas
 * 
 * @param {Object} options - Opções de configuração
 * @param {Date} options.minDate - Data mínima permitida
 * @param {Date} options.maxDate - Data máxima permitida
 * @param {Date[]} options.blockedDates - Datas bloqueadas
 * @returns {Object} Estado e funções do date picker
 */
const useDatePicker = (options = {}) => {
  const {
    minDate = getToday(),
    maxDate,
    blockedDates = [],
  } = options;

  // ==========================================================================
  // ESTADO
  // ==========================================================================

  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);

  // ==========================================================================
  // VALIDAÇÕES
  // ==========================================================================

  const isDateDisabled = useCallback(
    (date) => {
      if (!date) return true;
      
      // Verificar se é passado
      if (isPastDate(date)) return true;
      
      // Verificar se é antes do mínimo
      if (minDate && date < minDate) return true;
      
      // Verificar se é depois do máximo
      if (maxDate && date > maxDate) return true;
      
      // Verificar se está bloqueada
      if (!isDateAvailable(date, blockedDates)) return true;
      
      return false;
    },
    [minDate, maxDate, blockedDates]
  );

  // ==========================================================================
  // FUNÇÕES DE SELEÇÃO
  // ==========================================================================

  const selectDate = useCallback(
    (date) => {
      if (isDateDisabled(date)) return;

      // Se não há check-in, seleciona check-in
      if (!checkIn) {
        setCheckIn(date);
        setCheckOut(null);
        return;
      }

      // Se há check-in mas não check-out
      if (!checkOut) {
        // Se a data selecionada for antes do check-in
        if (date < checkIn) {
          setCheckIn(date);
          setCheckOut(null);
        } else {
          // Se for depois do check-in, define como check-out
          setCheckOut(date);
        }
        return;
      }

      // Se já tem ambos, reinicia com nova data como check-in
      setCheckIn(date);
      setCheckOut(null);
    },
    [checkIn, checkOut, isDateDisabled]
  );

  const resetDates = useCallback(() => {
    setCheckIn(null);
    setCheckOut(null);
  }, []);

  const clearDates = useCallback(() => {
    resetDates();
  }, [resetDates]);

  // ==========================================================================
  // NAVEGAÇÃO ENTRE MESES
  // ==========================================================================

  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() - 1);
      return newMonth;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + 1);
      return newMonth;
    });
  }, []);

  const goToToday = useCallback(() => {
    setCurrentMonth(getToday());
  }, []);

  // ==========================================================================
  // CONTROLE DO POPUP
  // ==========================================================================

  const openPicker = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closePicker = useCallback(() => {
    setIsOpen(false);
  }, []);

  const togglePicker = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // ==========================================================================
  // DADOS DERIVADOS
  // ==========================================================================

  const nights = useMemo(() => {
    return calculateNights(checkIn, checkOut);
  }, [checkIn, checkOut]);

  const isValid = useMemo(() => {
    return isValidDateRange(checkIn, checkOut);
  }, [checkIn, checkOut]);

  const displayValue = useMemo(() => {
    if (!checkIn && !checkOut) return '';
    if (checkIn && !checkOut) return formatDate(checkIn);
    if (checkIn && checkOut) {
      return `${formatDate(checkIn)} - ${formatDate(checkOut)}`;
    }
    return '';
  }, [checkIn, checkOut]);

  // ==========================================================================
  // FORMATTER (import local para evitar circular)
  // ==========================================================================

  const formatDate = (date) => {
    if (!date) return '';
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  // ==========================================================================
  // RETORNO
  // ==========================================================================

  return {
    // Estado
    checkIn,
    checkOut,
    currentMonth,
    isOpen,
    
    // Dados derivados
    nights,
    isValid,
    displayValue,
    
    // Funções de seleção
    selectDate,
    resetDates,
    clearDates,
    
    // Navegação
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    
    // Controle do popup
    openPicker,
    closePicker,
    togglePicker,
    
    // Validações
    isDateDisabled,
    
    // Configurações
    minDate,
    maxDate,
  };
};

export default useDatePicker;