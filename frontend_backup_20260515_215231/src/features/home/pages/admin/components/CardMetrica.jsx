// frontend/src/features/home/pages/admin/components/CardMetrica.jsx
import React from 'react';
import styles from './CardMetrica.module.css';

const CardMetrica = ({ 
  titulo, 
  valor, 
  icone, 
  cor = 'blue',
  variacao = null,
  loading = false 
}) => {
  if (loading) {
    return (
      <div className={`${styles.card} ${styles.skeleton}`}>
        <div className={styles.cardIcon}></div>
        <div className={styles.cardContent}>
          <div className={styles.skeletonTitle}></div>
          <div className={styles.skeletonValue}></div>
        </div>
      </div>
    );
  }

  const formatarValor = (val) => {
    if (typeof val === 'number') {
      if (titulo.toLowerCase().includes('receita')) {
        return new Intl.NumberFormat('pt-MZ', { 
          style: 'currency', 
          currency: 'MZN' 
        }).format(val);
      }
      return val.toLocaleString('pt-BR');
    }
    return val;
  };

  const getCorClasse = () => {
    const cores = {
      blue: styles.cardBlue,
      green: styles.cardGreen,
      orange: styles.cardOrange,
      purple: styles.cardPurple
    };
    return cores[cor] || styles.cardBlue;
  };

  return (
    <div className={`${styles.card} ${getCorClasse()}`}>
      <div className={styles.cardIcon}>
        <span className={styles.icon}>{icone}</span>
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{titulo}</h3>
        <p className={styles.cardValue}>{formatarValor(valor)}</p>
        {variacao !== null && (
          <div className={`${styles.variacao} ${variacao >= 0 ? styles.positivo : styles.negativo}`}>
            <span className={styles.variacaoIcon}>{variacao >= 0 ? '▲' : '▼'}</span>
            <span>{Math.abs(variacao)}%</span>
            <span className={styles.variacaoPeriodo}>vs período anterior</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardMetrica;