import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from './Header.module.css';

/**
 * Logo Component - Logo do hotel com link para home
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
          src="/src/assets/images/logo.png"
          alt="Hotel Paradise"
          className={styles.logoImage}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className={styles.logoFallback} style={{ display: 'none' }}>🏨</div>
      </div>

      <span className={styles.logoText}>
        Hotel <strong>Paradise</strong>
      </span>
    </Link>
  );
};

Logo.propTypes = {
  variant: PropTypes.oneOf(['light', 'dark']),
  className: PropTypes.string,
};

Logo.defaultProps = {
  variant: 'dark',
  className: '',
};

export default memo(Logo);
