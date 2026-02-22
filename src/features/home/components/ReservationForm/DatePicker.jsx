// ============================================
// COMPONENT: DatePicker
// ============================================
// Responsabilidade: Seleção de datas de check-in e check-out
// Acessibilidade: Navegação por teclado, ARIA labels
// ============================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './ReservationForm.module.css';

// ============================================
// CONSTANTES
// ============================================

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const MIN_NIGHTS = 1;
const MAX_NIGHTS = 30;
const MAX_ADVANCE_DAYS = 365; // Máximo 1 ano de antecedência

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const DatePicker = ({
  checkIn: externalCheckIn,
  checkOut: externalCheckOut,
  onChange,
  minDate = new Date(),
  maxDate = new Date(Date.now() + MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000),
  disabled = false,
  error = null,
  className = '',
  ...props
}) => {
  // ========================================
  // ESTADOS
  // ========================================
  
  const [checkIn, setCheckIn] = useState(externalCheckIn || '');
  const [checkOut, setCheckOut] = useState(externalCheckOut || '');
  const [touched, setTouched] = useState({ checkIn: false, checkOut: false });
  const [focused, setFocused] = useState({ checkIn: false, checkOut: false });
  const [validationErrors, setValidationErrors] = useState({});

  // ========================================
  // VALIDAÇÕES
  // ========================================
  
  const validateDates = useCallback((inDate, outDate) => {
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (inDate) {
      const checkInDate = new Date(inDate);
      
      if (checkInDate < today) {
        errors.checkIn = 'A data de check-in não pode ser no passado';
      } else if (checkInDate > maxDate) {
        errors.checkIn = 'Data muito distante. Máximo 1 ano de antecedência';
      }
    }

    if (outDate && inDate) {
      const checkInDate = new Date(inDate);
      const checkOutDate = new Date(outDate);
      
      const diffTime = checkOutDate - checkInDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < MIN_NIGHTS) {
        errors.checkOut = `Mínimo de ${MIN_NIGHTS} ${MIN_NIGHTS === 1 ? 'noite' : 'noites'}`;
      } else if (diffDays > MAX_NIGHTS) {
        errors.checkOut = `Máximo de ${MAX_NIGHTS} noites`;
      }
    }

    if (outDate && inDate && new Date(outDate) <= new Date(inDate)) {
      errors.checkOut = 'Check-out deve ser após o check-in';
    }

    return errors;
  }, [maxDate]);

  // ========================================
  // EFFECTS
  // ========================================
  
  useEffect(() => {
    if (externalCheckIn !== undefined) {
      setCheckIn(externalCheckIn);
    }
  }, [externalCheckIn]);

  useEffect(() => {
    if (externalCheckOut !== undefined) {
      setCheckOut(externalCheckOut);
    }
  }, [externalCheckOut]);

  useEffect(() => {
    const errors = validateDates(checkIn, checkOut);
    setValidationErrors(errors);

    // Notificar componente pai apenas se não houver erros
    if (Object.keys(errors).length === 0 && checkIn && checkOut) {
      onChange?.({
        checkIn,
        checkOut,
        nights: Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
      });
    }
  }, [checkIn, checkOut, validateDates, onChange]);

  // ========================================
  // HANDLERS
  // ========================================
  
  const handleCheckInChange = (e) => {
    const value = e.target.value;
    setCheckIn(value);
    setTouched(prev => ({ ...prev, checkIn: true }));
  };

  const handleCheckOutChange = (e) => {
    const value = e.target.value;
    setCheckOut(value);
    setTouched(prev => ({ ...prev, checkOut: true }));
  };

  const handleBlur = (field) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setFocused(prev => ({ ...prev, [field]: false }));
  };

  const handleFocus = (field) => () => {
    setFocused(prev => ({ ...prev, [field]: true }));
  };

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getMaxDateString = () => {
    const year = maxDate.getFullYear();
    const month = String(maxDate.getMonth() + 1).padStart(2, '0');
    const day = String(maxDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // ========================================
  // CLASSES CSS
  // ========================================
  
  const getFieldClasses = (field) => {
    const showError = touched[field] && validationErrors[field];
    return [
      styles.dateInput,
      showError && styles.error,
      focused[field] && styles.focused,
      disabled && styles.disabled
    ].filter(Boolean).join(' ');
  };

  // ========================================
  // RENDER
  // ========================================
  
  const showCheckInError = touched.checkIn && validationErrors.checkIn;
  const showCheckOutError = touched.checkOut && validationErrors.checkOut;

  return (
    <div className={`${styles.datePicker} ${className}`} {...props}>
      <div className={styles.dateInputs}>
        {/* Check-in */}
        <div className={styles.dateField}>
          <label 
            htmlFor="check-in" 
            className={styles.dateLabel}
          >
            Check-in
          </label>
          <input
            id="check-in"
            type="date"
            value={checkIn}
            onChange={handleCheckInChange}
            onBlur={handleBlur('checkIn')}
            onFocus={handleFocus('checkIn')}
            min={getTodayString()}
            max={getMaxDateString()}
            disabled={disabled}
            className={getFieldClasses('checkIn')}
            aria-invalid={showCheckInError}
            aria-describedby={showCheckInError ? 'check-in-error' : undefined}
          />
          {showCheckInError && (
            <span 
              id="check-in-error" 
              className={styles.errorMessage}
              role="alert"
            >
              {validationErrors.checkIn}
            </span>
          )}
        </div>

        {/* Check-out */}
        <div className={styles.dateField}>
          <label 
            htmlFor="check-out" 
            className={styles.dateLabel}
          >
            Check-out
          </label>
          <input
            id="check-out"
            type="date"
            value={checkOut}
            onChange={handleCheckOutChange}
            onBlur={handleBlur('checkOut')}
            onFocus={handleFocus('checkOut')}
            min={checkIn || getTodayString()}
            max={getMaxDateString()}
            disabled={disabled || !checkIn}
            className={getFieldClasses('checkOut')}
            aria-invalid={showCheckOutError}
            aria-describedby={showCheckOutError ? 'check-out-error' : undefined}
          />
          {showCheckOutError && (
            <span 
              id="check-out-error" 
              className={styles.errorMessage}
              role="alert"
            >
              {validationErrors.checkOut}
            </span>
          )}
        </div>
      </div>

      {/* Informações de período */}
      {checkIn && checkOut && !validationErrors.checkOut && (
        <div className={styles.dateInfo} aria-live="polite">
          <span className={styles.nightsCount}>
            {Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))} noites
          </span>
        </div>
      )}
    </div>
  );
};

DatePicker.displayName = 'DatePicker';