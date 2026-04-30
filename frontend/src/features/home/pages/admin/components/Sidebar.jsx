import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { useI18n } from '../../../../../contexts/I18nContext';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const { t } = useI18n();

  const menuItems = [
    { id: 1, path: '/admin/dashboard', labelKey: 'nav.dashboard', icon: '📊' },
    { id: 2, path: '/admin/quartos', labelKey: 'admin.rooms', icon: '🛏️' },
    { id: 3, path: '/admin/reservas', labelKey: 'nav.reservations', icon: '📅' },
    { id: 4, path: '/admin/utilizadores', labelKey: 'admin.users', icon: '👥' },
    { id: 5, path: '/admin/auditoria', labelKey: 'admin.audit', icon: '📋' },
    { id: 6, path: '/admin/relatorios', labelKey: 'admin.reports', icon: '📊' },
    { id: 7, path: '/admin/financeiro', labelKey: 'admin.financial', icon: '💰' },
  ];

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default memo(Sidebar);
