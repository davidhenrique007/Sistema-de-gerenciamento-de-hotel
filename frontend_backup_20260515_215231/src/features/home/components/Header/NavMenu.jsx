import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useI18n } from '../../../../contexts/I18nContext';
import styles from './Header.module.css';

const NavMenu = ({ onLinkClick, className = '' }) => {
  const { t } = useI18n();

  const navigationLinks = [
    { id: 1, path: '/', labelKey: 'nav.home', exact: true },
    { id: 2, path: '/rooms', labelKey: 'nav.rooms', exact: false },
    { id: 3, path: '/reservations', labelKey: 'nav.reservations', exact: false },
  ];

  const handleClick = () => {
    if (onLinkClick) onLinkClick();
  };

  return (
    <nav className={`${styles.navMenu} ${className}`} aria-label={t('nav.main_navigation')}>
      <ul className={styles.navList}>
        {navigationLinks.map((link) => (
          <li key={link.id} className={styles.navItem}>
            <NavLink
              to={link.path}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
              onClick={handleClick}
              end={link.exact}
            >
              {t(link.labelKey)}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

NavMenu.propTypes = {
  onLinkClick: PropTypes.func,
  className: PropTypes.string,
};

NavMenu.defaultProps = {
  onLinkClick: undefined,
  className: '',
};

export default memo(NavMenu);
