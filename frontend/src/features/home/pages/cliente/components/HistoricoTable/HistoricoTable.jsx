import React from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { formatDate } from '@/core/utils/dateFormatter';
import styles from './HistoricoTable.module.css';

const HistoricoTable = ({ historico }) => {
    const { t, language } = useI18n();

    const getTranslation = (key, defaultValue) => {
        const result = t(key);
        return typeof result === 'string' ? result : defaultValue;
    };

    const formatarMoeda = (valor) => {
        if (!valor) return '—';
        return new Intl.NumberFormat('pt-MZ', { 
            style: 'currency', 
            currency: 'MZN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(valor);
    };

    const getTipoQuarto = (tipo) => {
        const tipos = {
            standard: t('rooms.types.standard') || 'Standard',
            deluxe: t('rooms.types.deluxe') || 'Deluxe',
            suite: t('rooms.types.suite') || 'Suite',
            family: t('rooms.types.family') || 'Family',
            superior: t('rooms.types.superior') || 'Superior'
        };
        return tipos[tipo] || tipo || '—';
    };

    const getStatusText = (status) => {
        const statusMap = {
            confirmed: t('reservation.completed', 'Concluída'),
            cancelled: t('reservation.cancelled', 'Cancelada'),
            pending: t('reservation.pending', 'Pendente'),
            finalized: t('reservation.finalized', 'Finalizada')
        };
        return statusMap[status] || status || '—';
    };

    if (!historico || historico.length === 0) {
        return (
            <div className={styles.emptyHistorico}>
                <p>{getTranslation('reservation.no_history', 'Nenhuma reserva no histórico')}</p>
            </div>
        );
    }

    return (
        <div className={styles.historicoContainer}>
            <div className={styles.desktopView}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>{getTranslation('rooms.accommodation', 'Acomodação')}</th>
                            <th>{getTranslation('reservation.dates', 'Datas')}</th>
                            <th>{getTranslation('reservation.status', 'Status')}</th>
                            <th>{getTranslation('common.total', 'Valor')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historico.map((reserva, index) => (
                            <tr key={reserva.id || index}>
                                <td data-label={getTranslation('rooms.accommodation', 'Acomodação')}>{getTipoQuarto(reserva.room_type)}</td>
                                <td data-label={getTranslation('reservation.dates', 'Datas')}>
                                    {formatDate(reserva.check_in, language)} - {formatDate(reserva.check_out, language)}
                                </td>
                                <td data-label={getTranslation('reservation.status', 'Status')}>
                                    <span className={`${styles.status} ${styles[reserva.status]}`}>
                                        {getStatusText(reserva.status)}
                                    </span>
                                </td>
                                <td data-label={getTranslation('common.total', 'Valor')} className={styles.valorCell}>
                                    {formatarMoeda(reserva.total_price)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HistoricoTable;