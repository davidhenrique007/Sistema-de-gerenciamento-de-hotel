// ============================================
// COMPONENT: PaymentButton
// ============================================
// Responsabilidade: Botão de pagamento da Home, controlado por estado da reserva
// Arquitetura: Componente puramente presentacional, sem lógica de negócio
// ============================================

import React, { memo } from 'react';
import styles from './PaymentButton.module.css';

// ============================================
// CONSTANTES
// ============================================

const DEFAULT_LABEL = 'Prosseguir para Pagamento';
const DISABLED_LABEL = 'Complete a reserva para continuar';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const PaymentButton = memo(({
  // Estado
  isEnabled = false,
  total = 0,
  currency = 'MZN',
  
  // Textos
  label = DEFAULT_LABEL,
  disabledLabel = DISABLED_LABEL,
  
  // Callbacks
  onProceed,
  
  // Configurações
  showTotal = true,
  loading = false,
  
  // Classes adicionais
  className = '',
  ...props
}) => {
  // ========================================
  // FORMATADORES
  // ========================================
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // ========================================
  // HANDLERS
  // ========================================
  
  const handleClick = (e) => {
    if (!isEnabled || loading) {
      e.preventDefault();
      return;
    }
    
    if (onProceed) {
      onProceed();
    }
  };

  const handleKeyDown = (e) => {
    // Tecla Enter ou Espaço ativam o botão apenas se habilitado
    if ((e.key === 'Enter' || e.key === ' ') && isEnabled && !loading) {
      e.preventDefault();
      if (onProceed) {
        onProceed();
      }
    }
  };

  // ========================================
  // CLASSES CSS
  // ========================================
  
  const buttonClasses = [
    styles.button,
    isEnabled && !loading ? styles.enabled : styles.disabled,
    loading && styles.loading,
    className
  ].filter(Boolean).join(' ');

  // ========================================
  // RENDER
  // ========================================
  
  const totalFormatted = showTotal && total > 0 ? formatCurrency(total) : '';

  return (
    <div className={styles.container}>
      <button
        className={buttonClasses}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={!isEnabled || loading}
        aria-disabled={!isEnabled || loading}
        aria-label={isEnabled ? label : disabledLabel}
        tabIndex={isEnabled ? 0 : -1}
        {...props}
      >
        <span className={styles.content}>
          <span className={styles.label}>
            {loading ? 'Processando...' : label}
          </span>
          {showTotal && total > 0 && !loading && (
            <>
              <span className={styles.separator}>·</span>
              <span className={styles.total}>
                {totalFormatted}
              </span>
            </>
          )}
        </span>
        
        {loading && (
          <span className={styles.spinner} aria-hidden="true">
            <span className={styles.spinnerDot}></span>
            <span className={styles.spinnerDot}></span>
            <span className={styles.spinnerDot}></span>
          </span>
        )}
      </button>

      {/* Mensagem de ajuda para quando desabilitado */}
      {!isEnabled && !loading && (
        <p className={styles.helpText} aria-live="polite">
          {disabledLabel}
        </p>
      )}
    </div>
  );
});

PaymentButton.displayName = 'PaymentButton';

// ============================================
// COMPONENTE: FloatingPaymentButton
// ============================================
// Versão flutuante para mobile/scroll
// ============================================

export const FloatingPaymentButton = memo((props) => {
  return (
    <div className={styles.floatingContainer}>
      <PaymentButton {...props} />
    </div>
  );
});

FloatingPaymentButton.displayName = 'FloatingPaymentButton';
