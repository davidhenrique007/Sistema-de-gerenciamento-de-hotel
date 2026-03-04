import React, { forwardRef, memo } from 'react';
import PropTypes from 'prop-types';
import styles from './Container.module.css';

/**
 * Container Component - Centraliza e limita largura do conteúdo
 * 
 * @component
 * @example
 * <Container>
 *   <p>Conteúdo centralizado</p>
 * </Container>
 */
const Container = forwardRef(({
  children,
  as: Component = 'div',
  fluid = false,
  className = '',
  ...props
}, ref) => {
  // ==========================================================================
  // CLASSES CONDICIONAIS
  // ==========================================================================

  const containerClasses = [
    styles.container,
    fluid && styles.fluid,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <Component
      ref={ref}
      className={containerClasses}
      {...props}
    >
      {children}
    </Component>
  );
});

Container.displayName = 'Container';

Container.propTypes = {
  /** Conteúdo do container */
  children: PropTypes.node.isRequired,
  /** Tag HTML a ser renderizada */
  as: PropTypes.elementType,
  /** Container fluido (sem max-width) */
  fluid: PropTypes.bool,
  /** Classes CSS adicionais */
  className: PropTypes.string,
};

Container.defaultProps = {
  as: 'div',
  fluid: false,
  className: '',
};

export default memo(Container);