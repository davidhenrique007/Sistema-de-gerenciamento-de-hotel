import React, { memo } from 'react';
import PropTypes from 'prop-types';
import styles from './PriceSummary.module.css';

/**
 * PriceSummary Component - Resumo de preços da reserva
 * 
 * @component
 * @example
 * <PriceSummary
 *   breakdown={priceBreakdown}
 *   isLoading={false}
 * />
 */
const PriceSummary = ({ breakdown = {}, isLoading = false, className = '' }) => {
  // ==========================================================================
  // RENDER: LOADING
  // ==========================================================================

  if (isLoading) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          <span>Calculando preços...</span>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // RENDER: EMPTY
  // ==========================================================================

  if (!breakdown.total || breakdown.total.total === 0) {
    return (
      <div className={`${styles.container} ${className}`}>
        <p className={styles.emptyMessage}>
          Selecione as datas para ver o preço
        </p>
      </div>
    );
  }

  // ==========================================================================
  // RENDER: SUMMARY
  // ==========================================================================

  return (
    <div className={`${styles.container} ${className}`}>
      <h3 className={styles.title}>Resumo da Reserva</h3>

      {/* Breakdown dos itens */}
      <div className={styles.breakdown}>
        {breakdown.breakdown?.map((item) => (
          <div key={item.id} className={styles.breakdownItem}>
            <div className={styles.itemInfo}>
              <span className={styles.itemLabel}>{item.label}</span>
              {item.details && (
                <span className={styles.itemDetails}>{item.details}</span>
              )}
            </div>
            <span className={styles.itemAmount}>{item.formatted}</span>
          </div>
        ))}
      </div>

      {/* Subtotal */}
      <div className={styles.subtotal}>
        <span className={styles.subtotalLabel}>Subtotal</span>
        <span className={styles.subtotalAmount}>
          {breakdown.total?.formatted}
        </span>
      </div>

      {/* Taxas detalhadas (opcional) */}
      {breakdown.taxes?.breakdown && breakdown.taxes.breakdown.length > 0 && (
        <div className={styles.taxes}>
          <h4 className={styles.taxesTitle}>Taxas inclusas</h4>
          {breakdown.taxes.breakdown.map((tax, index) => (
            <div key={index} className={styles.taxItem}>
              <span className={styles.taxLabel}>{tax.name}</span>
              <span className={styles.taxAmount}>{tax.formatted}</span>
            </div>
          ))}
        </div>
      )}

      {/* Total final */}
      <div className={styles.total}>
        <span className={styles.totalLabel}>Total a pagar</span>
        <span className={styles.totalAmount}>
          {breakdown.total?.formatted}
        </span>
      </div>

      {/* Nota sobre taxas */}
      <p className={styles.note}>
        * Taxas e impostos inclusos no valor final
      </p>
    </div>
  );
};

PriceSummary.propTypes = {
  /** Dados do breakdown de preços */
  breakdown: PropTypes.shape({
    roomPrice: PropTypes.object,
    servicesPrice: PropTypes.object,
    taxes: PropTypes.object,
    total: PropTypes.shape({
      formatted: PropTypes.string,
    }),
    breakdown: PropTypes.array,
  }),
  /** Estado de carregamento */
  isLoading: PropTypes.bool,
  /** Classes CSS adicionais */
  className: PropTypes.string,
};

PriceSummary.defaultProps = {
  breakdown: {},
  isLoading: false,
  className: '',
};

export default memo(PriceSummary);