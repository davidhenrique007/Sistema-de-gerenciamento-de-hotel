import React from 'react';
import styles from './ReservaCard.module.css';

const ReservaCard = ({ reserva, onAlterar, onTrocarQuarto, onCancelar, onRecibo }) => {
    const formatarData = (data) => {
        return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '');
    };

    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(valor);
    };

    const noites = Math.ceil((new Date(reserva.check_out) - new Date(reserva.check_in)) / (1000 * 60 * 60 * 24));

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={styles.cardHeaderLeft}>
                    <span className={styles.reservaCode}>{reserva.reservation_code}</span>
                    <span className={`${styles.statusBadge} confirmed`}>✓ Confirmada</span>
                </div>
                <span className={styles.roomType}>
                    {reserva.room_type === 'deluxe' ? 'Suite Deluxe' : 
                     reserva.room_type === 'suite' ? 'Suite Presidencial' :
                     reserva.room_type === 'standard' ? 'Quarto Standard' : 'Quarto Família'}
                </span>
            </div>

            <div className={styles.cardBody}>
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>CHECK-IN</div>
                        <div className={styles.infoValue}>{formatarData(reserva.check_in)}</div>
                        <div style={{ fontSize: 11, color: '#6c757d' }}>14:00</div>
                    </div>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>CHECK-OUT</div>
                        <div className={styles.infoValue}>{formatarData(reserva.check_out)}</div>
                        <div style={{ fontSize: 11, color: '#6c757d' }}>12:00</div>
                    </div>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>NOITES</div>
                        <div className={styles.infoValue} style={{ fontSize: 20, color: '#f59e0b' }}>{noites}</div>
                    </div>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>HÓSPEDES</div>
                        <div className={styles.infoValue} style={{ fontSize: 20, color: '#f59e0b' }}>
                            {reserva.adults_count || 2}
                            {reserva.children_count > 0 ? ` + ${reserva.children_count}` : ''}
                        </div>
                    </div>
                </div>

                <div className={styles.priceRow}>
                    <span className={styles.priceLabel}>TOTAL</span>
                    <span className={styles.priceValue}>{formatarMoeda(reserva.total_price)}</span>
                </div>

                <div className={styles.cancelPolicy}>
                    <span>⚠️</span> Cancelamento grátis até 24h antes do check-in
                </div>
            </div>

            <div className={styles.cardFooter}>
                <button onClick={() => onAlterar(reserva)} className={`${styles.actionBtn} alterarBtn`}>
                    Alterar Reserva
                </button>
                <button onClick={() => onTrocarQuarto(reserva)} className={`${styles.actionBtn} trocarBtn`}>
                    Trocar Quarto
                </button>
                <button onClick={() => onCancelar(reserva)} className={`${styles.actionBtn} cancelarBtn`}>
                    Cancelar Reserva
                </button>
                <button onClick={() => onRecibo(reserva)} className={`${styles.actionBtn} reciboBtn`}>
                    Reenviar Recibo
                </button>
            </div>
        </div>
    );
};

export default ReservaCard;
