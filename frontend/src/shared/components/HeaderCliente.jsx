// =====================================================
// HOTEL PARADISE - HEADER COM INFORMAÇÕES DO CLIENTE
// Versão: 1.0.0
// =====================================================

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCliente } from '../hooks/useCliente';
import LogoutButton from './LogoutButton';
import styles from './HeaderCliente.module.css';

const HeaderCliente = () => {
  const { isIdentificado, nomeAbreviado, iniciais, tempoSessao } = useCliente();
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <img src="/assets/images/logo.png" alt="Hotel Paradise" />
          <span>Hotel Paradise</span>
        </Link>

        <div className={styles.nav}>
          <Link to="/quartos" className={styles.navLink}>
            Quartos
          </Link>
          <Link to="/servicos" className={styles.navLink}>
            Serviços
          </Link>
          <Link to="/contato" className={styles.navLink}>
            Contato
          </Link>
        </div>

        <div className={styles.userSection}>
          {isIdentificado ? (
            <>
              <div className={styles.userInfo}>
                <div className={styles.avatar}>
                  {iniciais}
                </div>
                <div className={styles.userDetails}>
                  <span className={styles.userName}>{nomeAbreviado}</span>
                  <span className={styles.sessionTime}>
                    Sessão: {tempoSessao}
                  </span>
                </div>
              </div>
              <LogoutButton variant="outline" />
            </>
          ) : (
            <button 
              className={styles.loginButton}
              onClick={() => navigate('/login-cliente')}
            >
              Entrar / Identificar-se
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderCliente;