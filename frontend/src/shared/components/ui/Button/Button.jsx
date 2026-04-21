import React, { forwardRef, memo } from 'react';
import PropTypes from 'prop-types';
import styles from './Button.module.css';

/**
 * Button Component - Base do Design System Corporativo
 * 
 * @component
 * @example
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Reservar Agora
 * </Button>
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  onClick,
  fullWidth = false,
  loading = false,
  className = '',
  ariaLabel,
  ...props
}, ref) => {
  // ==========================================================================
  // CLASSES CONDICIONAIS
  // ==========================================================================
  
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    loading && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleClick = (event) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      aria-label={ariaLabel}
      {...props}
    >
      {loading ? (
        <span className={styles.loadingContent}>
          <span className={styles.spinner} aria-hidden="true" />
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  /** Conteúdo do botão */
  children: PropTypes.node.isRequired,
  /** Variante visual */
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline']),
  /** Tamanho do botão */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Tipo HTML do botão */
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  /** Estado desabilitado */
  disabled: PropTypes.bool,
  /** Função de clique */
  onClick: PropTypes.func,
  /** Ocupa 100% da largura do container */
  fullWidth: PropTypes.bool,
  /** Estado de carregamento */
  loading: PropTypes.bool,
  /** Classes CSS adicionais */
  className: PropTypes.string,
  /** Label acessível (quando sem texto visível) */
  ariaLabel: PropTypes.string,
};

Button.defaultProps = {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  fullWidth: false,
  loading: false,
  className: '',
  ariaLabel: undefined,
  onClick: undefined,
};

// Memo para evitar re-renderizações desnecessárias
export default memo(Button);