import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen, onToggle, onLogout, user }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'receptionist', 'financial'] },
    { path: '/admin/analises', label: 'Análises', icon: '📈', roles: ['admin', 'receptionist', 'financial'] },
    { path: '/admin/reservas', label: 'Reservas', icon: '📅', roles: ['admin', 'receptionist'] },
    { path: '/admin/pagamentos', label: 'Pagamentos', icon: '💰', roles: ['admin', 'financial'] },
    { path: '/admin/quartos', label: 'Quartos', icon: '🏨', roles: ['admin'] },
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

  // Verificar tamanho da tela ao redimensionar
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
      {/* Botão de menu hambúrguer para mobile */}
      <button 
        className={styles.menuButton}
        onClick={handleMenuToggle}
        aria-label="Menu"
      >
        <span className={styles.menuIcon}>☰</span>
      </button>

      {/* Overlay para mobile quando sidebar está aberta */}
      {mobileOpen && window.innerWidth <= 768 && (
        <div className={styles.overlay} onClick={handleMenuToggle} />
      )}
      
      <div className={`${styles.sidebar} ${isSidebarOpen ? styles.open : styles.closed}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🏨</span>
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
              {user?.name?.charAt(0) || 'U'}
            </div>
            {isSidebarOpen && (
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
            {isSidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
