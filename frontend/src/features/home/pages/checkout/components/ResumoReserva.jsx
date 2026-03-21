import React from 'react';
import styles from '../styles/Checkout.module.css';

const ResumoReserva = ({ tipoQuarto, checkIn, checkOut, nights, pricePerNight, total }) => {
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'MZN'
    }).format(value);
  };

  return (
    <div className={styles.resumoCard}>
      <h3 className={styles.resumoTitulo}>Resumo da Reserva</h3>
      
      <div className={styles.resumoLinha}>
        <span>Quarto:</span>
        <span className={styles.resumoValor}>{tipoQuarto}</span>
      </div>

      <div className={styles.resumoLinha}>
        <span>Check-in:</span>
        <span className={styles.resumoValor}>{formatDate(checkIn)}</span>
      </div>

      <div className={styles.resumoLinha}>
        <span>Check-out:</span>
        <span className={styles.resumoValor}>{formatDate(checkOut)}</span>
      </div>

      <div className={styles.resumoLinha}>
        <span>Noites:</span>
        <span className={styles.resumoValor}>{nights}</span>
      </div>

      <div className={styles.resumoLinha}>
        <span>Preço por noite:</span>
        <span className={styles.resumoValor}>{formatCurrency(pricePerNight)}</span>
      </div>

      <div className={styles.totalLinha}>
        <span>TOTAL:</span>
        <span className={styles.totalValor}>{formatCurrency(total)}</span>
      </div>
    </div>
  );
};

export default ResumoReserva;
