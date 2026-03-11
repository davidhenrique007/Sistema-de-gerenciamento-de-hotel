import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from './Header.module.css';

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
      <svg 
        className={styles.logoIcon} 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path 
          d="M20 0L0 10V30L20 40L40 30V10L20 0Z" 
          className={styles.logoPrimary}
        />
        <path 
          d="M20 5L5 12.5V27.5L20 35L35 27.5V12.5L20 5Z" 
          className={styles.logoSecondary}
        />
        <text 
          x="20" 
          y="25" 
          textAnchor="middle" 
          className={styles.logoText}
          fontSize="14" 
          fontWeight="bold"
        >
          HP
        </text>
      </svg>
      
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