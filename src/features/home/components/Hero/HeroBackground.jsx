import React from 'react';
import PropTypes from 'prop-types';
import styles from './Hero.module.css';

/**
 * HeroBackground Component - Fundo do hero com overlay
 * 
 * @component
 * @example
 * <HeroBackground image="/images/hero-bg.jpg" />
 */
const HeroBackground = ({ image, overlay = true }) => {
  const backgroundStyle = image
    ? { backgroundImage: `url(${image})` }
    : {};

  return (
    <div className={styles.background} style={backgroundStyle}>
      {overlay && <div className={styles.overlay} />}
    </div>
  );
};

HeroBackground.propTypes = {
  /** URL da imagem de fundo */
  image: PropTypes.string,
  /** Mostrar overlay escuro */
  overlay: PropTypes.bool,
};

HeroBackground.defaultProps = {
  image: undefined,
  overlay: true,
};

export default React.memo(HeroBackground);