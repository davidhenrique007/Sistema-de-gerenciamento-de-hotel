import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
import logoImage from '../../../../../assets/images/Login/logo.png';

const Sidebar = ({ isOpen, onToggle, onLogout, user }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'receptionist', 'financial'] },
    { path: '/admin/analises', label: 'Análises', icon: '📈', roles: ['admin', 'receptionist', 'financial'] },
    { path: '/admin/reservas', label: 'Reservas', icon: '📅', roles: ['admin', 'receptionist'] },
    { path: '/admin/financeiro', label: 'Financeiro', icon: '💰', roles: ['admin', 'financial'] },
    { path: '/admin/quartos', label: 'Quartos', icon: '🏨', roles: ['admin'] },
    { path: '/admin/relatorios', label: 'Relatórios', icon: '📊', roles: ['admin', 'financial'] },
    { path: '/admin/utilizadores', label: 'Utilizadores', icon: '👥', roles: ['admin'] },
    { path: '/admin/auditoria', label: 'Auditoria', icon: '📋', roles: ['admin'] },
    { path: '/admin/lixeira', label: 'Lixeira', icon: '🗑️', roles: ['admin'] },
    { path: '/admin/configuracoes', label: 'Configurações', icon: '⚙️', roles: ['admin'] }
  ];

  const userRole = user?.role || 'admin';

  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      setMobileOpen(false);
      if (onToggle) onToggle();
    }
  };

  const handleMenuToggle = () => {
    setMobileOpen(!mobileOpen);
    if (onToggle) onToggle();
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileOpen]);

  const isSidebarOpen = window.innerWidth <= 768 ? mobileOpen : isOpen;

  return (
    <>
      <button 
        className={styles.menuButton}
        onClick={handleMenuToggle}
        aria-label="Menu"
      >
        <span className={styles.menuIcon}>☰</span>
      </button>

      {mobileOpen && window.innerWidth <= 768 && (
        <div className={styles.overlay} onClick={handleMenuToggle} />
      )}
      
      <div className={`${styles.sidebar} ${isSidebarOpen ? styles.open : styles.closed}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoArea}>
            <div className={styles.logoWrapper}>
              <div className={styles.logoCircle}></div>
              <img 
                src={logoImage} 
                alt="Hotel Paradise" 
                className={styles.logoImage}
              />
            </div>
            {isSidebarOpen && <span className={styles.logoText}>Hotel Paradise</span>}
          </div>
          {window.innerWidth > 768 && (
            <button onClick={onToggle} className={styles.toggleBtn}>
              {isSidebarOpen ? '◀' : '▶'}
            </button>
          )}
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => {
            if (!item.roles.includes(userRole)) return null;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={({ isActive }) => 
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {isSidebarOpen && <span className={styles.navLabel}>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user?.name?.charAt(0) || 'A'}
            </div>
            {isSidebarOpen && (
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user?.name || 'Administrador'}</span>
                <span className={styles.userRole}>
                  {userRole === 'admin' ? 'Administrador' : 
                   userRole === 'receptionist' ? 'Rececionista' : 'Financeiro'}
                </span>
              </div>
            )}
          </div>
          <button onClick={onLogout} className={styles.logoutBtn}>
            <span className={styles.logoutIcon}>🚪</span>
            {isSidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
