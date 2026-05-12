// =====================================================
// COMPONENTE - CHECKOUT HEADER
// Versão: 2.0.0 (Com suporte a i18n)
// =====================================================

import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CheckoutHeader.module.css';

// Caminho correto para a logo - do diretório atual até assets/images
// CheckoutHeader está em: src/features/home/pages/checkout/components/CheckoutHeader/
// Logo está em: src/assets/images/logo.png
// Subir 6 níveis: ../../../../../../assets/images/logo.png

const CheckoutHeader = ({ isIdentificado = false, t }) => {
  // Função segura para obter tradução
  const getTranslation = (key, defaultValue) => {
    if (!t) return defaultValue;
    const result = t(key);
    if (typeof result === 'string') return result;
    return defaultValue;
  };

  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerTop}>
          <div className={styles.logoContainer}>
            <div className={styles.logoCircle}></div>
            <img 
              src="/src/assets/images/logo.png"
              alt={getTranslation('nav.home', 'Hotel Paradise')} 
              className={styles.logo}
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = 'flex';
                }
              }}
            />
            <div className={styles.logoFallback} style={{ display: 'none' }}>🏨</div>
          </div>
          <div className={styles.titleSection}>
            <p className={styles.welcomeMessage}>HOTEL PARADISE</p>
            <h1 className={styles.title}>{getTranslation('checkout.title', 'Checkout')}</h1>
            <p className={styles.subtitle}>
              {getTranslation('checkout.complete_reservation', 'Complete sua reserva com segurança e rapidez')}
            </p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <Link to="/" className={styles.backButton}>
            ← {getTranslation('common.back', 'Voltar')}
          </Link>
          {isIdentificado && (
            <Link to="/minhas-reservas" className={styles.minhasReservasButton}>
              📋 {getTranslation('nav.reservations', 'Minhas Reservas')}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutHeader;