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

// ============================================
// ÍCONES SVG (inline para evitar dependências)
// ============================================

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
  // ESTADOS E REFS
  // ========================================
  
  const [guests, setGuests] = useState(externalValue);
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(externalValue);
  const timeoutRef = useRef(null);

  // ========================================
  // EFFECTS
  // ========================================
  
  // Sincronizar com valor externo
  useEffect(() => {
    if (externalValue !== undefined && externalValue !== guests) {
      setGuests(externalValue);
    }
  }, [externalValue]);

  // Limpar timeout no unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // ========================================
  // VALIDAÇÕES
  // ========================================
  
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

  // ========================================
  // HANDLERS COM ANIMAÇÃO
  // ========================================
  
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
    
    setGuests(prev => {
      const newValue = prev + 1;
      const errorMsg = validateGuests(newValue);
      setError(errorMsg);
      
      if (!errorMsg) {
        triggerAnimation();
        onChange?.(newValue);
        return newValue;
      }
      return prev;
    });
  }, [disabled, onChange, validateGuests]);

  const handleDecrement = useCallback(() => {
    if (disabled) return;
    
    setGuests(prev => {
      const newValue = Math.max(min, prev - 1);
      const errorMsg = validateGuests(newValue);
      setError(errorMsg);
      
      if (!errorMsg) {
        triggerAnimation();
        onChange?.(newValue);
        return newValue;
      }
      return prev;
    });
  }, [disabled, min, onChange, validateGuests]);

  const handleKeyDown = useCallback((e) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        handleIncrement();
        break;
      case 'ArrowRight':
        e.preventDefault();
        handleIncrement();
        break;
      case 'ArrowDown':
        e.preventDefault();
        handleDecrement();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        handleDecrement();
        break;
      case 'Home':
        e.preventDefault();
        if (min !== guests) {
          setGuests(min);
          onChange?.(min);
          triggerAnimation();
        }
        break;
      case 'End':
        e.preventDefault();
        const maxValue = maxPerRoom || max;
        if (maxValue !== guests) {
          setGuests(maxValue);
          onChange?.(maxValue);
          triggerAnimation();
        }
        break;
      default:
        break;
    }
  }, [disabled, handleIncrement, handleDecrement, min, max, maxPerRoom, guests, onChange]);

  // ========================================
  // CLASSES CSS
  // ========================================
  
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

  // ========================================
  // RENDER
  // ========================================
  
  return (
    <div 
      className={containerClasses}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {/* Label */}
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}

      {/* Controles */}
      <div className={styles.controls}>
        {/* Botão Diminuir */}
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

        {/* Valor Central */}
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

        {/* Botão Aumentar */}
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

      {/* Mensagem de erro */}
      {error && (
        <div 
          className={styles.errorMessage}
          role="alert"
        >
          <span className={styles.errorIcon}>⚠️</span>
          {error}
        </div>
      )}

      {/* Hint de limites (acessibilidade) */}
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