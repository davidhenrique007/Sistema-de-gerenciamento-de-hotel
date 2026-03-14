// =====================================================
// HOTEL PARADISE - BOTÃO DE LOGOUT
// Versão: 1.0.0
// =====================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCliente } from '../hooks/useCliente';
import styles from './LogoutButton.module.css';

const LogoutButton = ({ variant = 'default', showConfirmation = true }) => {
  const navigate = useNavigate();
  const { logoutCliente, nomeAbreviado } = useCliente();

  const handleLogout = () => {
    if (showConfirmation) {
      const confirmar = window.confirm('Tem certeza que deseja sair?');
      if (!confirmar) return;
    }
    
    logoutCliente();
    navigate('/');
  };

  return (
    <button 
      onClick={handleLogout}
      className={`${styles.logoutButton} ${styles[variant]}`}
      title="Sair da conta"
    >
      <span className={styles.icon}>🚪</span>
      {variant !== 'icon' && (
        <span>Sair {nomeAbreviado ? `(${nomeAbreviado})` : ''}</span>
      )}
    </button>
  );
};

export default LogoutButton;