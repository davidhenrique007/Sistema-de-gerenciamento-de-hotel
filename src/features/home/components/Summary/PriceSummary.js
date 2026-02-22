// ============================================
// COMPONENT: PriceSummary
// ============================================
// Responsabilidade: Resumo financeiro dinâmico da reserva
// Acessibilidade: aria-live="polite" para atualizações
// ============================================

import React, { useMemo, memo } from 'react';
import styles from './PriceSummary.module.css';

// ============================================
// HOOK DE CÁLCULO (separado da UI)
// ============================================

const usePriceCalculations = (breakdown) => {
  return useMemo(() => {
    if (!breakdown) {
      return {
        roomSubtotal: 0,
        servicesSubtotal: 0,
        taxesTotal: 0,
        grandTotal: 0,
        hasServices: false
      };
    }

    const roomSubtotal = breakdown.roomPrice?.subtotal || 0;
    
    const servicesSubtotal = breakdown.services?.reduce(
      (sum, service) => sum + (service.subtotal || 0), 
      0
    ) || 0;

    const taxesTotal = Object.values(breakdown.taxes || {}).reduce(
      (sum, tax) => sum + (tax.amount || 0), 
      0
    );

    const grandTotal = breakdown.total?.amount || roomSubtotal + servicesSubtotal + taxesTotal;

    return {
      roomSubtotal,
      servicesSubtotal,
      taxesTotal,
      grandTotal,
      hasServices: servicesSubtotal > 0
    };
  }, [breakdown]);
};

// ============================================
// COMPONENTES AUXILIARES
// ============================================

const PriceRow = ({ label, value, highlight = false, className = '' }) => (
  <div className={`${styles.priceRow} ${className}`}>
    <span className={styles.rowLabel}>{label}</span>
    <span className={`${styles.rowValue} ${highlight ? styles.highlight : ''}`}>
      {value}
    </span>
  </div>
);

const Divider = () => <div className={styles.divider} />;

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const PriceSummary = memo(({
  breakdown,
  isLoading = false,
  showTaxes = true,
  currency = 'MZN',
  className = '',
  ...props
}) => {
  // ========================================
  // CÁLCULOS
  // ========================================
  
  const {
    roomSubtotal,
    servicesSubtotal,
    taxesTotal,
    grandTotal,
    hasServices
  } = usePriceCalculations(breakdown);

  // ========================================
  // FORMATAÇÃO
  // ========================================
  
  const formatPrice = (value) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // ========================================
  // RENDER
  // ========================================
  
  if (isLoading) {
    return (
      <div className={`${styles.summary} ${styles.loading} ${className}`} {...props}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonRow} />
          <div className={styles.skeletonRow} />
          <div className={styles.skeletonRow} />
          <div className={styles.skeletonTotal} />
        </div>
      </div>
    );
  }

  if (!breakdown) {
    return (
      <div className={`${styles.summary} ${styles.empty} ${className}`} {...props}>
        <p className={styles.emptyMessage}>
          Selecione as datas e o número de hóspedes para ver o preço
        </p>
      </div>
    );
  }

  return (
    <section 
      className={`${styles.summary} ${className}`}
      aria-label="Resumo de preços"
      aria-live="polite"
      {...props}
    >
      <h2 className={styles.title}>Resumo da Reserva</h2>

      <div className={styles.content}>
        {/* Detalhes do período */}
        {breakdown.nights && (
          <div className={styles.period}>
            <span className={styles.periodLabel}>Período:</span>
            <span className={styles.periodValue}>
              {breakdown.checkIn} a {breakdown.checkOut} · {breakdown.nights} {breakdown.nights === 1 ? 'noite' : 'noites'}
            </span>
          </div>
        )}

        {breakdown.guestsCount && (
          <div className={styles.guests}>
            <span className={styles.guestsLabel}>Hóspedes:</span>
            <span className={styles.guestsValue}>
              {breakdown.guestsCount} {breakdown.guestsCount === 1 ? 'hóspede' : 'hóspedes'}
            </span>
          </div>
        )}

        <Divider />

        {/* Preços */}
        <PriceRow 
          label="Quarto" 
          value={formatPrice(roomSubtotal)}
        />

        {hasServices && (
          <>
            <PriceRow 
              label="Serviços adicionais" 
              value={formatPrice(servicesSubtotal)}
            />
            <div className={styles.servicesList}>
              {breakdown.services?.map((service, index) => (
                <div key={index} className={styles.serviceItem}>
                  <span className={styles.serviceName}>{service.name}</span>
                  <span className={styles.servicePrice}>
                    {formatPrice(service.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {showTaxes && taxesTotal > 0 && (
          <PriceRow 
            label="Impostos e taxas" 
            value={formatPrice(taxesTotal)}
          />
        )}

        <Divider />

        {/* Total */}
        <PriceRow 
          label="Total" 
          value={formatPrice(grandTotal)}
          highlight
          className={styles.totalRow}
        />

        {/* Notas */}
        <div className={styles.notes}>
          <p className={styles.note}>
            * Preços sujeitos a alteração conforme disponibilidade
          </p>
        </div>
      </div>
    </section>
  );
});

PriceSummary.displayName = 'PriceSummary';