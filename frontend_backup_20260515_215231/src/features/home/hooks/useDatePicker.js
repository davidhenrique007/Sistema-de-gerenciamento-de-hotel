import { useState, useCallback, useMemo, useRef } from 'react';
import {
  getToday,
  isPastDate,
  isValidDateRange,
  calculateNights,
  isDateAvailable,
} from '../../../shared/utils/dateUtils';

const useDatePicker = (options = {}) => {
  const {
    minDate = getToday(),
    maxDate,
    blockedDates = [],
  } = options;

  // ==========================================================================
  // FORMATDATE DEFINIDA PRIMEIRO
  // ==========================================================================
  const formatDate = useCallback((date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }, []);

  // ==========================================================================
  // ESTADO
  // ==========================================================================
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);

  // ==========================================================================
  // REFS PARA CONTROLAR LOOP
  // ==========================================================================
  const isUpdatingRef = useRef(false);

  // ==========================================================================
  // VALIDAÇÕES
  // ==========================================================================
  const isDateDisabled = useCallback(
    (date) => {
      if (!date) return true;
      if (isPastDate(date)) return true;
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      if (!isDateAvailable(date, blockedDates)) return true;
      return false;
    },
    [minDate, maxDate, blockedDates]
  );

  // ==========================================================================
  // FUNÇÕES DE SELEÇÃO - COM PROTEÇÃO CONTRA LOOP
  // ==========================================================================
  const selectDate = useCallback(
    (date) => {
      if (isUpdatingRef.current) return;
      if (isDateDisabled(date)) return;

      isUpdatingRef.current = true;

      if (!checkIn) {
        setCheckIn(date);
        setCheckOut(null);
      } else if (!checkOut) {
        if (date < checkIn) {
          setCheckIn(date);
          setCheckOut(null);
        } else {
          setCheckOut(date);
        }
      } else {
        setCheckIn(date);
        setCheckOut(null);
      }

      // Reset após atualização
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 100);
    },
    [checkIn, checkOut, isDateDisabled]
  );

  const resetDates = useCallback(() => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    setCheckIn(null);
    setCheckOut(null);
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 100);
  }, []);

  // ==========================================================================
  // NAVEGAÇÃO
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

  // ==========================================================================
  // CONTROLE DO POPUP
  // ==========================================================================
  const openPicker = useCallback(() => setIsOpen(true), []);
  const closePicker = useCallback(() => setIsOpen(false), []);
  const togglePicker = useCallback(() => setIsOpen(prev => !prev), []);

  // ==========================================================================
  // DADOS DERIVADOS
  // ==========================================================================
  const nights = useMemo(() => calculateNights(checkIn, checkOut), [checkIn, checkOut]);
  const isValid = useMemo(() => isValidDateRange(checkIn, checkOut), [checkIn, checkOut]);

  const displayValue = useMemo(() => {
    if (!checkIn && !checkOut) return '';
    if (checkIn && !checkOut) return formatDate(checkIn);
    if (checkIn && checkOut) {
      return `${formatDate(checkIn)} - ${formatDate(checkOut)}`;
    }
    return '';
  }, [checkIn, checkOut, formatDate]);

  return {
    checkIn,
    checkOut,
    currentMonth,
    isOpen,
    nights,
    isValid,
    displayValue,
    selectDate,
    resetDates,
    goToPreviousMonth,
    goToNextMonth,
    openPicker,
    closePicker,
    togglePicker,
    isDateDisabled,
    minDate,
    maxDate,
  };
};

export default useDatePicker;