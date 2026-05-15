import React from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { formatDate, calculateNights } from '@/core/utils/dateFormatter';
import styles from './ReservaCard.module.css';

const ReservaCard = ({ reserva, onAlterar, onTrocarQuarto, onCancelar, onRecibo }) => {
    const { t, language } = useI18n();

    const getTranslation = (key, defaultValue) => {
        const result = t(key);
        return typeof result === 'string' ? result : defaultValue;
    };

    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-MZ', { 
            style: 'currency', 
            currency: 'MZN' 
        }).format(valor);
    };

    const getTipoQuarto = (tipo) => {
        const tipos = {
            standard: t('rooms.types.standard') || 'Standard',
            deluxe: t('rooms.types.deluxe') || 'Deluxe',
            suite: t('rooms.types.suite') || 'Suite',
            family: t('rooms.types.family') || 'Family'
        };
        return tipos[tipo] || tipo;
    };

    const getStatusText = (status) => {
        const statusMap = {
            confirmed: getTranslation('reservation.confirmed', 'Confirmada'),
            pending: getTranslation('reservation.pending', 'Pendente'),
            cancelled: getTranslation('reservation.cancelled', 'Cancelada'),
            finalized: getTranslation('reservation.finalized', 'Finalizada')
        };
        return statusMap[status] || status;
    };

    const noites = calculateNights(reserva.check_in, reserva.check_out);

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={styles.cardHeaderLeft}>
                    <span className={styles.reservaCode}>{reserva.reservation_code}</span>
                    <span className={`${styles.statusBadge} ${styles.confirmed}`}>
                        {getStatusText(reserva.status)}
                    </span>
                </div>
                <span className={styles.roomType}>
                    {getTipoQuarto(reserva.room_type)}
                </span>
            </div>

            <div className={styles.cardBody}>
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <div className={`${styles.infoLabel} ${styles.checkinLabel}`}>{getTranslation('reservation.checkin', 'CHECK-IN')}</div>
                        <div className={styles.infoValue}>{formatDate(reserva.check_in, language)}</div>
                        <div className={styles.infoTime}>14:00</div>
                    </div>
                    <div className={styles.infoItem}>
                        <div className={`${styles.infoLabel} ${styles.checkoutLabel}`}>{getTranslation('reservation.checkout', 'CHECK-OUT')}</div>
                        <div className={styles.infoValue}>{formatDate(reserva.check_out, language)}</div>
                        <div className={styles.infoTime}>12:00</div>
                    </div>
                    <div className={styles.infoItem}>
                        <div className={`${styles.infoLabel} ${styles.nightsLabel}`}>{getTranslation('reservation.nights', 'NOITES')}</div>
                        <div className={styles.nightsValue}>{noites}</div>
                    </div>
                    <div className={styles.infoItem}>
                        <div className={`${styles.infoLabel} ${styles.guestsLabel}`}>{getTranslation('reservation.guests', 'HÓSPEDES')}</div>
                        <div className={styles.guestsValue}>
                            {reserva.adults_count || 2}
                            {reserva.children_count > 0 ? ` + ${reserva.children_count}` : ''}
                        </div>
                    </div>
                </div>

                <div className={styles.priceRow}>
                    <span className={styles.priceLabel}>{getTranslation('common.total', 'TOTAL')}</span>
                    <span className={styles.priceValue}>{formatarMoeda(reserva.total_price)}</span>
                </div>

                <div className={styles.cancelPolicy}>
                    {getTranslation('policy.free_cancellation', 'Cancelamento grátis até 24h antes do check-in')}
                </div>
            </div>

            <div className={styles.cardFooter}>
                <button onClick={() => onAlterar(reserva)} className={`${styles.actionBtn} ${styles.alterarBtn}`}>
                    {getTranslation('reservation.modify', 'Alterar Reserva')}
                </button>
                <button onClick={() => onTrocarQuarto(reserva)} className={`${styles.actionBtn} ${styles.trocarBtn}`}>
                    {getTranslation('reservation.change_room', 'Trocar Quarto')}
                </button>
                <button onClick={() => onCancelar(reserva)} className={`${styles.actionBtn} ${styles.cancelarBtn}`}>
                    {getTranslation('reservation.cancel', 'Cancelar Reserva')}
                </button>
                <button onClick={() => onRecibo(reserva)} className={`${styles.actionBtn} ${styles.reciboBtn}`}>
                    {getTranslation('receipt.resend', 'Reenviar Recibo')}
                </button>
            </div>
        </div>
    );
};

export default ReservaCard;