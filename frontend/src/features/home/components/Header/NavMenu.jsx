import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import navigationLinks from '../../constants/navigation';
import styles from './Header.module.css';

/**
 * NavMenu Component - Menu de navegação para desktop
 * 
 * @component
 * @example
 * <NavMenu onLinkClick={handleLinkClick} />
 */
const NavMenu = ({ onLinkClick, className = '' }) => {
  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <nav className={`${styles.navMenu} ${className}`} aria-label="Navegação principal">
      <ul className={styles.navList}>
        {navigationLinks.map((link) => (
          <li key={link.id} className={styles.navItem}>
            <NavLink
              to={link.path}
              className={({ isActive }) => 
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
              onClick={handleClick}
              end={link.exact}
              aria-current={({ isActive }) => isActive ? 'page' : undefined}
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

NavMenu.propTypes = {
  /** Função chamada ao clicar em um link */
  onLinkClick: PropTypes.func,
  /** Classes CSS adicionais */
  className: PropTypes.string,
};

NavMenu.defaultProps = {
  onLinkClick: undefined,
  className: '',
};

export default memo(NavMenu);