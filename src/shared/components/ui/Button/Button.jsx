// ============================================
// COMPONENT: Button
// ============================================
// Responsabilidade: Botão reutilizável com variantes
// Acessibilidade: ARIA labels, foco visível, suporte a teclado
// ============================================

import React, { forwardRef } from 'react';
import styles from './Button.module.css';

// ============================================
// CONSTANTES
// ============================================

export const ButtonVariant = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  OUTLINE: 'outline',
  GHOST: 'ghost',
  DANGER: 'danger',
  SUCCESS: 'success'
};

export const ButtonSize = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const Button = forwardRef(({
  // Conteúdo
  children,
  
  // Variantes e estilo
  variant = ButtonVariant.PRIMARY,
  size = ButtonSize.MEDIUM,
  fullWidth = false,
  
  // Estados
  disabled = false,
  loading = false,
  
  // Ícones
  leftIcon,
  rightIcon,
  
  // Acessibilidade
  ariaLabel,
  ariaExpanded,
  ariaControls,
  
  // Eventos
  onClick,
  onFocus,
  onBlur,
  
  // Tipo do botão
  type = 'button',
  
  // Classes adicionais
  className = '',
  
  // Resto das props
  ...props
}, ref) => {
  // ========================================
  // CLASSES CSS
  // ========================================
  
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    loading && styles.loading,
    className
  ].filter(Boolean).join(' ');

  // ========================================
  // HANDLERS
  // ========================================
  
  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  const handleKeyDown = (e) => {
    // Suporte para Enter e Espaço (acessibilidade)
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled && !loading && onClick) {
        onClick(e);
      }
    }
  };

  // ========================================
  // RENDER
  // ========================================
  
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className={styles.spinner} aria-hidden="true">
          <span className={styles.spinnerDot}></span>
          <span className={styles.spinnerDot}></span>
          <span className={styles.spinnerDot}></span>
        </span>
      )}
      
      <span className={styles.content}>
        {leftIcon && (
          <span className={styles.leftIcon} aria-hidden="true">
            {leftIcon}
          </span>
        )}
        
        <span className={styles.text}>{children}</span>
        
        {rightIcon && (
          <span className={styles.rightIcon} aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </span>
    </button>
  );
});

Button.displayName = 'Button';

// PropTypes virtuais para documentação
Button.propTypes = {
  variant: Object.values(ButtonVariant),
  size: Object.values(ButtonSize),
  fullWidth: 'boolean',
  disabled: 'boolean',
  loading: 'boolean',
  type: 'button submit reset'
};