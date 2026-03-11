import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { GUEST_TYPES } from '../../hooks/useGuestCounter';
import styles from './GuestSelector.module.css';

/**
 * GuestSelector Component - Seletor de quantidade de hóspedes por tipo
 * 
 * @component
 * @example
 * <GuestSelector
 *   guests={{ adults: 2, children: 1, babies: 0 }}
 *   onIncrement={(type) => handleIncrement(type)}
 *   onDecrement={(type) => handleDecrement(type)}
 *   hasReachedMin={(type) => isMinReached(type)}
 *   hasReachedMax={(type) => isMaxReached(type)}
 * />
 */
const GuestSelector = ({
  guests,
  onIncrement,
  onDecrement,
  hasReachedMin,
  hasReachedMax,
  className = '',
}) => {
  // ==========================================================================
  // LABELS E ÍCONES
  // ==========================================================================

  const guestTypeConfig = {
    [GUEST_TYPES.ADULTS]: {
      label: 'Adultos',
      description: 'Acima de 12 anos',
      icon: '👤',
    },
    [GUEST_TYPES.CHILDREN]: {
      label: 'Crianças',
      description: '2 a 12 anos',
      icon: '🧒',
    },
    [GUEST_TYPES.BABIES]: {
      label: 'Bebês',
      description: 'Abaixo de 2 anos',
      icon: '👶',
    },
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className={`${styles.container} ${className}`}>
      <h3 className={styles.title}>Hóspedes</h3>
      
      <div className={styles.guestsList}>
        {Object.values(GUEST_TYPES).map((type) => {
          const config = guestTypeConfig[type];
          const count = guests[type];
          const isMinReached = hasReachedMin?.(type);
          const isMaxReached = hasReachedMax?.(type);

          return (
            <div key={type} className={styles.guestItem}>
              <div className={styles.guestInfo}>
                <span className={styles.guestIcon}>{config.icon}</span>
                <div>
                  <div className={styles.guestLabel}>{config.label}</div>
                  <div className={styles.guestDescription}>{config.description}</div>
                </div>
              </div>

              <div className={styles.guestControls}>
                <button
                  className={styles.controlButton}
                  onClick={() => onDecrement(type)}
                  disabled={isMinReached}
                  aria-label={`Remover ${config.label.toLowerCase()}`}
                  type="button"
                >
                  −
                </button>

                <span className={styles.guestCount} aria-live="polite">
                  {count}
                </span>

                <button
                  className={styles.controlButton}
                  onClick={() => onIncrement(type)}
                  disabled={isMaxReached}
                  aria-label={`Adicionar ${config.label.toLowerCase()}`}
                  type="button"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.totalContainer}>
        <span className={styles.totalLabel}>Total de hóspedes</span>
        <span className={styles.totalValue}>
          {guests.adults + guests.children + guests.babies}
        </span>
      </div>
    </div>
  );
};

GuestSelector.propTypes = {
  /** Objeto com contagem de hóspedes */
  guests: PropTypes.shape({
    adults: PropTypes.number.isRequired,
    children: PropTypes.number.isRequired,
    babies: PropTypes.number.isRequired,
  }).isRequired,
  /** Função chamada ao incrementar */
  onIncrement: PropTypes.func.isRequired,
  /** Função chamada ao decrementar */
  onDecrement: PropTypes.func.isRequired,
  /** Função para verificar se atingiu mínimo */
  hasReachedMin: PropTypes.func,
  /** Função para verificar se atingiu máximo */
  hasReachedMax: PropTypes.func,
  /** Classes CSS adicionais */
  className: PropTypes.string,
};

GuestSelector.defaultProps = {
  hasReachedMin: () => false,
  hasReachedMax: () => false,
  className: '',
};

export default memo(GuestSelector);