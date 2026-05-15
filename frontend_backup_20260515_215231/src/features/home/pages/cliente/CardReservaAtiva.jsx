import React from 'react';
import styles from './styles/CardReservaAtiva.module.css';

const CardReservaAtiva = ({ reserva, onAtualizar }) => {
    const checkIn = new Date(reserva.check_in);
    const checkOut = new Date(reserva.check_out);
    
    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(valor);
    };
    
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <span className={styles.codigo}>{reserva.reservation_code}</span>
                <span className={`${styles.status} ${styles[reserva.status]}`}>
                    {reserva.status === 'confirmed' ? '✓ Confirmada' : 
                     reserva.status === 'pending' ? '⏳ Pendente' : '📅 Ativa'}
                </span>
            </div>
            <div className={styles.roomInfo}>
                <span>🏨 Quarto {reserva.room_number} - {reserva.room_type}</span>
            </div>
            <div className={styles.dates}>
                <span>📅 {checkIn.toLocaleDateString()} a {checkOut.toLocaleDateString()}</span>
                <span>{Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))} noite(s)</span>
            </div>
            <div className={styles.price}>
                <strong>Total: {formatarMoeda(reserva.total_price)}</strong>
            </div>
        </div>
    );
};
