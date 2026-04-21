import React from 'react';
import styles from './StatusBadge.module.css';

const StatusBadge = ({ status }) => {
  const config = {
    available: {
      label: 'Disponível',
      icon: '🟢',
      className: styles.available
    },
    occupied: {
      label: 'Ocupado',
      icon: '🔴',
      className: styles.occupied
    },
    maintenance: {
      label: 'Manutenção',
      icon: '🟡',
      className: styles.maintenance
    },
    inactive: {
      label: 'Inativo',
      icon: '⚫',
      className: styles.inactive
    }
  };

  const current = config[status] || config.available;

  return (
    <span className={`${styles.badge} ${current.className}`}>
      <span className={styles.icon}>{current.icon}</span>
      <span className={styles.label}>{current.label}</span>
    </span>
  );
};

export default StatusBadge;
