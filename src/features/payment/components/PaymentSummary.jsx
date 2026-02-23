// ============================================
// COMPONENT: PaymentSummary
// ============================================
// Responsabilidade: Resumo final consolidado da reserva para checkout
// Arquitetura: Componente puramente apresentacional
// ============================================

import React, { memo } from 'react';
import styles from './PaymentSummary.module.css';

// ============================================
// CONSTANTES
// ============================================

const CURRENCY = 'MZN';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const PaymentSummary = memo(({
  // Dados da reserva
  room,
  checkIn,
  checkOut,
  guests,
  nights,
  services = [],
  
  // Preços
  roomPrice = 0,
  servicesPrice = 0,
  taxes = 0,
  total = 0,
  
  // Formatação
  currency = CURRENCY,
  
  // Configurações
  showBreakdown = true,
  compact = false,
  
  // Classes
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // ========================================
  // RENDER
  // ========================================
  
  if (!room) {
    return (
      <section className={`${styles.summary} ${styles.empty} ${className}`} {...props}>
        <p className={styles.emptyMessage}>
          Selecione um quarto para ver o resumo
        </p>
      </section>
    );
  }

  return (
    <section 
      className={`${styles.summary} ${compact ? styles.compact : ''} ${className}`}
      aria-label="Resumo do pagamento"
      {...props}
    >
      <h2 className={styles.title}>Resumo da Reserva</h2>

      {/* Informações do quarto */}
      <div className={styles.roomInfo}>
        <h3 className={styles.roomTitle}>
          {room.typeLabel} - Quarto {room.number}
        </h3>
        <div className={styles.roomDetails}>
          <span className={styles.roomCapacity}>
            {guests} {guests === 1 ? 'hóspede' : 'hóspedes'}
          </span>
          <span className={styles.roomNights}>
            {nights} {nights === 1 ? 'noite' : 'noites'}
          </span>
        </div>
      </div>

      {/* Período */}
      <div className={styles.period}>
        <div className={styles.periodRow}>
          <span className={styles.periodLabel}>Check-in:</span>
          <span className={styles.periodValue}>{formatDate(checkIn)}</span>
        </div>
        <div className={styles.periodRow}>
          <span className={styles.periodLabel}>Check-out:</span>
          <span className={styles.periodValue}>{formatDate(checkOut)}</span>
        </div>
      </div>

      {/* Serviços adicionais */}
      {services.length > 0 && (
        <div className={styles.services}>
          <h3 className={styles.servicesTitle}>Serviços Adicionais</h3>
          <ul className={styles.servicesList}>
            {services.map((service, index) => (
              <li key={index} className={styles.serviceItem}>
                <span className={styles.serviceName}>{service.name}</span>
                <span className={styles.servicePrice}>
                  {formatCurrency(service.price || 0)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Breakdown de preços */}
      {showBreakdown && (
        <div className={styles.breakdown}>
          <div className={styles.breakdownRow}>
            <span className={styles.breakdownLabel}>Quarto</span>
            <span className={styles.breakdownValue}>
              {formatCurrency(roomPrice)}
            </span>
          </div>

          {servicesPrice > 0 && (
            <div className={styles.breakdownRow}>
              <span className={styles.breakdownLabel}>Serviços</span>
              <span className={styles.breakdownValue}>
                {formatCurrency(servicesPrice)}
              </span>
            </div>
          )}

          {taxes > 0 && (
            <div className={styles.breakdownRow}>
              <span className={styles.breakdownLabel}>Impostos e taxas</span>
              <span className={styles.breakdownValue}>
                {formatCurrency(taxes)}
              </span>
            </div>
          )}

          <div className={styles.divider} />

          <div className={`${styles.breakdownRow} ${styles.totalRow}`}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalValue}>
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      )}

      {/* Versão compacta (apenas total) */}
      {!showBreakdown && (
        <div className={styles.totalCompact}>
          <span className={styles.totalCompactLabel}>Total</span>
          <span className={styles.totalCompactValue}>
            {formatCurrency(total)}
          </span>
        </div>
      )}

      {/* Notas */}
      <div className={styles.notes}>
        <p className={styles.note}>
          * Pagamento seguro processado na próxima etapa
        </p>
        <p className={styles.note}>
          * Política de cancelamento: até 24h antes do check-in
        </p>
      </div>
    </section>
  );
});

PaymentSummary.displayName = 'PaymentSummary';