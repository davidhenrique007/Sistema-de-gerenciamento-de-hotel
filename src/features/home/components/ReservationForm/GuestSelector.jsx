// ============================================
// COMPONENT: GuestSelector
// ============================================
// Responsabilidade: Controle de incremento/decremento de hóspedes
// Acessibilidade: ARIA labels, navegação por teclado
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import styles from './ReservationForm.module.css';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const GuestSelector = ({
  value: externalValue = 1,
  onChange,
  min = 1,
  max = 10,
  maxPerRoom = null,
  disabled = false,
  label = 'Hóspedes',
  className = '',
  ...props
}) => {
  // ========================================
  // ESTADOS
  // ========================================
  
  const [guests, setGuests] = useState(externalValue);
  const [error, setError] = useState('');

  // ========================================
  // EFFECTS
  // ========================================
  
  useEffect(() => {
    if (externalValue !== undefined) {
      setGuests(externalValue);
    }
  }, [externalValue]);

  // ========================================
  // HANDLERS
  // ========================================
  
  const validateGuests = useCallback((value) => {
    if (maxPerRoom && value > maxPerRoom) {
      return `Máximo de ${maxPerRoom} hóspedes por quarto`;
    }
    if (value > max) {
      return `Máximo de ${max} hóspedes`;
    }
    return '';
  }, [max, maxPerRoom]);

  const handleIncrement = useCallback(() => {
    setGuests(prev => {
      const newValue = prev + 1;
      const errorMsg = validateGuests(newValue);
      setError(errorMsg);
      
      if (!errorMsg) {
        onChange?.(newValue);
        return newValue;
      }
      return prev;
    });
  }, [onChange, validateGuests]);

  const handleDecrement = useCallback(() => {
    setGuests(prev => {
      const newValue = Math.max(min, prev - 1);
      const errorMsg = validateGuests(newValue);
      setError(errorMsg);
      
      if (!errorMsg) {
        onChange?.(newValue);
        return newValue;
      }
      return prev;
    });
  }, [min, onChange, validateGuests]);

  const handleInputChange = useCallback((e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setGuests(value);
      const errorMsg = validateGuests(value);
      setError(errorMsg);
      
      if (!errorMsg) {
        onChange?.(value);
      }
    }
  }, [onChange, validateGuests]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    }
  }, [handleIncrement, handleDecrement]);

  // ========================================
  // CLASSES CSS
  // ========================================
  
  const containerClasses = [
    styles.guestSelector,
    disabled && styles.disabled,
    error && styles.hasError,
    className
  ].filter(Boolean).join(' ');

  // ========================================
  // RENDER
  // ========================================
  
  const guestsMin = min;
  const guestsMax = maxPerRoom || max;

  return (
    <div className={containerClasses} {...props}>
      <label 
        htmlFor="guests" 
        className={styles.guestLabel}
      >
        {label}
      </label>

      <div className={styles.guestControls}>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || guests <= min}
          className={styles.guestButton}
          aria-label="Diminuir número de hóspedes"
        >
          −
        </button>

        <div className={styles.guestValue}>
          <input
            id="guests"
            type="number"
            value={guests}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            min={min}
            max={guestsMax}
            disabled={disabled}
            className={styles.guestInput}
            aria-label="Número de hóspedes"
            aria-valuemin={min}
            aria-valuemax={guestsMax}
            aria-valuenow={guests}
            aria-invalid={!!error}
            aria-describedby={error ? 'guest-error' : undefined}
          />
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || guests >= guestsMax}
          className={styles.guestButton}
          aria-label="Aumentar número de hóspedes"
        >
          +
        </button>
      </div>

      {error && (
        <span 
          id="guest-error" 
          className={styles.guestError}
          role="alert"
        >
          {error}
        </span>
      )}

      <div className={styles.guestHint} aria-live="polite">
        {guests} {guests === 1 ? 'hóspede' : 'hóspedes'}
      </div>
    </div>
  );
};

GuestSelector.displayName = 'GuestSelector';