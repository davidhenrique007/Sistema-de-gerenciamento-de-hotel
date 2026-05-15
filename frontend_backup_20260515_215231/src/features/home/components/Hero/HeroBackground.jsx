import React, { memo } from 'react';
import PropTypes from 'prop-types';
import styles from './Hero.module.css';

/**
 * HeroBackground Component - Fundo do hero com overlay e efeitos
 * 
 * @component
 * @example
 * <HeroBackground
 *   image="/images/hero-bg.jpg"
 *   overlay={true}
 *   parallax={true}
 * />
 */
const HeroBackground = ({ 
  image, 
  overlay = true,
  parallax = false,
  className = '',
}) => {
  // ==========================================================================
  // STYLES
  // ==========================================================================

  const backgroundStyle = image
    ? { backgroundImage: `url(${image})` }
    : {};

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div 
      className={`
        ${styles.background}
        ${parallax ? styles.parallax : ''}
        ${className}
      `}
      style={backgroundStyle}
      aria-hidden="true"
    >
      {overlay && <div className={styles.overlay} />}
      
      {/* Elementos decorativos opcionais */}
      <div className={styles.pattern} />
    </div>
  );
};

HeroBackground.propTypes = {
  /** URL da imagem de fundo */
  image: PropTypes.string,
  /** Mostrar overlay escuro */
  overlay: PropTypes.bool,
  /** Efeito parallax */
  parallax: PropTypes.bool,
  /** Classes CSS adicionais */
  className: PropTypes.string,
};

HeroBackground.defaultProps = {
  image: '/assets/images/hero-bg.jpg',
  overlay: true,
  parallax: false,
  className: '',
};

export default memo(HeroBackground);