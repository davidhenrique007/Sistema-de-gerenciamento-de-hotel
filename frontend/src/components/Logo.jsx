import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from './Header.module.css';
import logoImage from '../../assets/images/logo.png';

/**
 * Logo Component - Logo do hotel com link para home
 * 
 * @component
 * @example
 * <Logo variant="light" />
 */
const Logo = ({ variant = 'dark', className = '' }) => {
  return (
    <Link 
      to="/" 
      className={`${styles.logo} ${styles[variant]} ${className}`}
      aria-label="Hotel Paradise - Página inicial"
    >
      <div className={styles.logoImageContainer}>
        <img 
          src={logoImage} 
          alt="Hotel Paradise" 
          className={styles.logoImage}
        />
      </div>
      
      <span className={styles.logoText}>
        Hotel <strong>Paradise</strong>
      </span>
    </Link>
  );
};

Logo.propTypes = {
  /** Variante de cor (light/dark) */
  variant: PropTypes.oneOf(['light', 'dark']),
  /** Classes CSS adicionais */
  className: PropTypes.string,
};

Logo.defaultProps = {
  variant: 'dark',
  className: '',
};

export default memo(Logo);

