// src/features/home/pages/cliente/components/reservas/ReservaStatusBadge.jsx
import React from 'react';
import { getStatusInfo } from '../../utils/reservaHelpers';
import styles from './ReservaStatusBadge.module.css';

const ReservaStatusBadge = ({ status }) => {
    const statusInfo = getStatusInfo(status);
    
    return (
        <span 
            className={styles.badge}
            style={{ 
                backgroundColor: statusInfo.bg,
                color: statusInfo.color
            }}
        >
            <span className={styles.icon}>{statusInfo.icon}</span>
            <span className={styles.label}>{statusInfo.label}</span>
        </span>
    );
};

export default ReservaStatusBadge;