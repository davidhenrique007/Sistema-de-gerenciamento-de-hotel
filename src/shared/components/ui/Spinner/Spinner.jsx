import React, { memo } from 'react';
import PropTypes from 'prop-types';
import styles from './Spinner.module.css';

/**
 * Spinner Component - Indicador de carregamento acessível
 * 
 * @component
 * @example
 * <Spinner size="lg" />
 * <Spinner size="md" label="Carregando dados..." />
 */
const Spinner = ({
  size = 'md',
  fullScreen = false,
  label = 'Carregando...',
  className = '',
}) => {
  // ==========================================================================
  // CLASSES CONDICIONAIS
  // ==========================================================================

  const spinnerClasses = [
    styles.spinner,
    styles[size],
    fullScreen && styles.fullScreen,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div
      className={spinnerClasses}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className={styles.circle} />
      <span className="sr-only">{label}</span>
    </div>
  );
};

Spinner.propTypes = {
  /** Tamanho do spinner */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Ocupa tela inteira */
  fullScreen: PropTypes.bool,
  /** Label acessível */
  label: PropTypes.string,
  /** Classes CSS adicionais */
  className: PropTypes.string,
};

Spinner.defaultProps = {
  size: 'md',
  fullScreen: false,
  label: 'Carregando...',
  className: '',
};

export default memo(Spinner);