// frontend/src/features/home/components/Header/NavMenu.jsx
import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useI18n } from '../../../../contexts/I18nContext'; // ✅ ADICIONADO
import styles from './Header.module.css';

/**
 * NavMenu Component - Menu de navegação para desktop
 * 
 * @component
 * @example
 * <NavMenu onLinkClick={handleLinkClick} />
 */
const NavMenu = ({ onLinkClick, className = '' }) => {
  const { t } = useI18n(); // ✅ ADICIONADO

  // ==========================================================================
  // NAVEGAÇÃO COM TRADUÇÃO
  // ==========================================================================

  const navigationLinks = [
    { id: 1, path: '/', labelKey: 'nav.home', exact: true },
    { id: 2, path: '/rooms', labelKey: 'nav.rooms', exact: false },
    { id: 3, path: '/reservations', labelKey: 'nav.reservations', exact: false },
  ];

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
    <nav className={`${styles.navMenu} ${className}`} aria-label={t('nav.main_navigation') || "Navegação principal"}>
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
              {t(link.labelKey)} {/* ✅ TRADUZIDO */}
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