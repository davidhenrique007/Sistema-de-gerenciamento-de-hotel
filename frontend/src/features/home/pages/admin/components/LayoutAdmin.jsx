import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import styles from './LayoutAdmin.module.css';

const LayoutAdmin = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

<<<<<<< HEAD
  // Função para registrar logout manual
  const registrarLogout = async () => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      try {
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          keepalive: true
        });
        console.log('✅ Logout registrado com sucesso');
      } catch (error) {
        console.error('Erro ao registrar logout:', error);
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const adminUserStr = localStorage.getItem('admin_user');

=======
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const adminUserStr = localStorage.getItem('admin_user');
    
>>>>>>> origin/main
    if (!token || !adminUserStr) {
      navigate('/login-admin');
      return;
    }
<<<<<<< HEAD

=======
    
>>>>>>> origin/main
    try {
      const userData = JSON.parse(adminUserStr);
      if (userData && userData.name) {
        setUser(userData);
      } else {
        navigate('/login-admin');
      }
    } catch (e) {
      console.error('Erro ao parsear usuário:', e);
      navigate('/login-admin');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

<<<<<<< HEAD
  const handleLogout = async () => {
    await registrarLogout();
=======
  // Adicionar/remover classe no body quando sidebar abre/fecha no mobile
  useEffect(() => {
    if (window.innerWidth <= 768) {
      if (sidebarOpen) {
        document.body.classList.add('sidebar-open');
      } else {
        document.body.classList.remove('sidebar-open');
      }
    }
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
>>>>>>> origin/main
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/login-admin');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.layout}>
<<<<<<< HEAD
      <Sidebar
        isOpen={sidebarOpen}
=======
      <Sidebar 
        isOpen={sidebarOpen} 
>>>>>>> origin/main
        onToggle={toggleSidebar}
        onLogout={handleLogout}
        user={user}
      />
      <div className={`${styles.mainContent} ${!sidebarOpen ? styles.expanded : ''}`}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.headerTitle}>Painel Administrativo</h1>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.headerDate}>
<<<<<<< HEAD
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
=======
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
>>>>>>> origin/main
              })}
            </span>
          </div>
        </header>
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default LayoutAdmin;
