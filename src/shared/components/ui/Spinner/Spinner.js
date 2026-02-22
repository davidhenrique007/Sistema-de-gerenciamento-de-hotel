// ============================================
// COMPONENT: Spinner
// ============================================
// Responsabilidade: Loading spinner reutilizável com animação CSS
// Acessibilidade: role="status", aria-live="polite"
// ============================================

import React from 'react';
import styles from './Spinner.module.css';

// ============================================
// CONSTANTES
// ============================================

export const SpinnerSize = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
};

export const SpinnerColor = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  LIGHT: 'light',
  DARK: 'dark'
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const Spinner = ({
  // Tamanho
  size = SpinnerSize.MEDIUM,
  
  // Cor
  color = SpinnerColor.PRIMARY,
  
  // Label para acessibilidade (opcional)
  label = 'Carregando...',
  
  // Esconder label visualmente (apenas para leitores de tela)
  hideLabel = false,
  
  // Classes adicionais
  className = '',
  
  // Props adicionais
  ...props
}) => {
  // ========================================
  // CLASSES CSS
  // ========================================
  
  const spinnerClasses = [
    styles.spinner,
    styles[size],
    styles[color],
    className
  ].filter(Boolean).join(' ');

  const labelClasses = [
    styles.label,
    hideLabel && styles.visuallyHidden
  ].filter(Boolean).join(' ');

  // ========================================
  // RENDER
  // ========================================
  
  return (
    <div
      className={spinnerClasses}
      role="status"
      aria-live="polite"
      aria-label={label}
      {...props}
    >
      <div className={styles.circle}>
        <div className={styles.path}></div>
      </div>
      {label && (
        <span className={labelClasses}>
          {label}
        </span>
      )}
    </div>
  );
};

Spinner.displayName = 'Spinner';

// ============================================
// COMPONENTE: SpinnerOverlay
// ============================================
// Responsabilidade: Spinner com overlay para blocos de conteúdo
// ============================================

export const SpinnerOverlay = ({
  visible = false,
  children,
  spinnerProps = {},
  blur = true,
  transparent = false
}) => {
  if (!visible) return children;

  return (
    <div className={styles.overlayContainer}>
      {children}
      <div className={`${styles.overlay} ${blur ? styles.blur : ''} ${transparent ? styles.transparent : ''}`}>
        <Spinner {...spinnerProps} />
      </div>
    </div>
  );
};

SpinnerOverlay.displayName = 'SpinnerOverlay';

// ============================================
// COMPONENTE: SpinnerInline
// ============================================
// Responsabilidade: Spinner para uso inline com texto
// ============================================

export const SpinnerInline = ({
  text = 'Carregando...',
  size = SpinnerSize.SMALL,
  color = SpinnerColor.PRIMARY,
  className = '',
  ...props
}) => {
  return (
    <div className={`${styles.inlineContainer} ${className}`} {...props}>
      <Spinner size={size} color={color} hideLabel />
      {text && <span className={styles.inlineText}>{text}</span>}
    </div>
  );
};

SpinnerInline.displayName = 'SpinnerInline';