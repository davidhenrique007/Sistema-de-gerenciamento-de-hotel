import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen, onToggle, onLogout, user }) => {
  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'receptionist', 'financial'] },
    { path: '/admin/reservas', label: 'Reservas', icon: '📅', roles: ['admin', 'receptionist'] },
    { path: '/admin/pagamentos', label: 'Pagamentos', icon: '💰', roles: ['admin', 'financial'] },
    { path: '/admin/quartos', label: 'Quartos', icon: '🏨', roles: ['admin'] },
    { path: '/admin/configuracoes', label: 'Configurações', icon: '⚙️', roles: ['admin'] }
  ];

  const userRole = user?.role || 'admin';

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🏨</span>
          {isOpen && <span className={styles.logoText}>Hotel Paradise</span>}
        </div>
        <button onClick={onToggle} className={styles.toggleBtn}>
          {isOpen ? '◀' : '▶'}
        </button>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => {
          if (!item.roles.includes(userRole)) return null;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {isOpen && <span className={styles.navLabel}>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          {isOpen && (
            <div className={styles.userDetails}>
              <span className={styles.userName}>{user?.name || 'Usuário'}</span>
              <span className={styles.userRole}>
                {userRole === 'admin' ? 'Administrador' : 
                 userRole === 'receptionist' ? 'Recepcionista' : 'Financeiro'}
              </span>
            </div>
          )}
        </div>
        <button onClick={onLogout} className={styles.logoutBtn}>
          <span className={styles.logoutIcon}>🚪</span>
          {isOpen && <span>Sair</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
