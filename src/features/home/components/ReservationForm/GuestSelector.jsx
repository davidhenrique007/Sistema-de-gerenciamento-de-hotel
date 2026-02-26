// ============================================
// COMPONENT: GuestSelector
// ============================================
// Responsabilidade: Controle de incremento/decremento de hóspedes
// Design System: Botões circulares com ícones, animações suaves
// Acessibilidade: WCAG 2.1+ com navegação por teclado
// Arquitetura: Puramente apresentacional, controlado
// ============================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './GuestSelector.module.css';

const MinusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

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
  const [guests, setGuests] = useState(externalValue);
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (externalValue !== undefined && externalValue !== guests) {
      setGuests(externalValue);
    }
  }, [externalValue]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const validateGuests = useCallback((value) => {
    if (maxPerRoom && value > maxPerRoom) {
      return `Máximo de ${maxPerRoom} ${maxPerRoom === 1 ? 'hóspede' : 'hóspedes'} por quarto`;
    }
    if (value > max) {
      return `Máximo de ${max} ${max === 1 ? 'hóspede' : 'hóspedes'}`;
    }
    if (value < min) {
      return `Mínimo de ${min} ${min === 1 ? 'hóspede' : 'hóspedes'}`;
    }
    return '';
  }, [min, max, maxPerRoom]);

  const triggerAnimation = () => {
    setIsAnimating(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, 200);
  };

  const handleIncrement = useCallback(() => {
    if (disabled) return;
    
    console.log('[GuestSelector] Incrementar - valor atual:', guests);
    
    setGuests(prev => {
      const newValue = prev + 1;
      const errorMsg = validateGuests(newValue);
      setError(errorMsg);
      
      if (!errorMsg) {
        triggerAnimation();
        onChange?.(newValue);
        console.log('[GuestSelector] Novo valor:', newValue);
        return newValue;
      }
      console.log('[GuestSelector] Incremento bloqueado - erro:', errorMsg);
      return prev;
    });
  }, [disabled, guests, onChange, validateGuests]);

  const handleDecrement = useCallback(() => {
    if (disabled) return;
    
    console.log('[GuestSelector] Decrementar - valor atual:', guests);
    
    setGuests(prev => {
      const newValue = Math.max(min, prev - 1);
      const errorMsg = validateGuests(newValue);
      setError(errorMsg);
      
      if (!errorMsg) {
        triggerAnimation();
        onChange?.(newValue);
        console.log('[GuestSelector] Novo valor:', newValue);
        return newValue;
      }
      console.log('[GuestSelector] Decremento bloqueado - erro:', errorMsg);
      return prev;
    });
  }, [disabled, min, guests, onChange, validateGuests]);

  const handleKeyDown = useCallback((e) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        e.preventDefault();
        handleIncrement();
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        e.preventDefault();
        handleDecrement();
        break;
      case 'Home':
        e.preventDefault();
        if (min !== guests) {
          console.log('[GuestSelector] Home - indo para mínimo:', min);
          setGuests(min);
          onChange?.(min);
          triggerAnimation();
        }
        break;
      case 'End':
        e.preventDefault();
        const maxValue = maxPerRoom || max;
        if (maxValue !== guests) {
          console.log('[GuestSelector] End - indo para máximo:', maxValue);
          setGuests(maxValue);
          onChange?.(maxValue);
          triggerAnimation();
        }
        break;
      default:
        break;
    }
  }, [disabled, handleIncrement, handleDecrement, min, max, maxPerRoom, guests, onChange]);

  const containerClasses = [
    styles.container,
    disabled && styles.disabled,
    className
  ].filter(Boolean).join(' ');

  const valueClasses = [
    styles.value,
    isAnimating && styles.valueAnimating,
    error && styles.valueError
  ].filter(Boolean).join(' ');

  const isMinReached = guests <= min;
  const isMaxReached = maxPerRoom ? guests >= maxPerRoom : guests >= max;

  console.log('[GuestSelector] Valor atual:', guests);
  console.log('[GuestSelector] Limites:', { min, max: maxPerRoom || max, isMinReached, isMaxReached });

  return (
    <div 
      className={containerClasses}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}

      <div className={styles.controls}>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || isMinReached}
          className={`${styles.button} ${styles.buttonMinus}`}
          aria-label="Diminuir número de hóspedes"
          aria-disabled={disabled || isMinReached}
        >
          <MinusIcon />
        </button>

        <div 
          className={valueClasses}
          aria-live="polite"
          aria-atomic="true"
        >
          <span className={styles.valueNumber}>{guests}</span>
          <span className={styles.valueText}>
            {guests === 1 ? 'hóspede' : 'hóspedes'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || isMaxReached}
          className={`${styles.button} ${styles.buttonPlus}`}
          aria-label="Aumentar número de hóspedes"
          aria-disabled={disabled || isMaxReached}
        >
          <PlusIcon />
        </button>
      </div>

      {error && (
        <div 
          className={styles.errorMessage}
          role="alert"
        >
          <span className={styles.errorIcon}>⚠️</span>
          {error}
        </div>
      )}

      <div className={styles.hint} aria-hidden="true">
        {!disabled && (
          <>
            {isMinReached && <span>Mínimo atingido</span>}
            {isMaxReached && <span>Máximo atingido</span>}
          </>
        )}
      </div>
    </div>
  );
};

GuestSelector.displayName = 'GuestSelector';