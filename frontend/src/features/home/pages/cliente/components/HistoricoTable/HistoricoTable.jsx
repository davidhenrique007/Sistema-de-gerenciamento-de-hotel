import React from 'react';
import styles from './HistoricoTable.module.css';

const HistoricoTable = ({ historico }) => {
    const formatarData = (data) => {
        if (!data) return '—';
        return new Date(data).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
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
            standard: 'Quarto Standard',
            deluxe: 'Suite Deluxe',
            suite: 'Suite Presidencial',
            family: 'Quarto Família',
            superior: 'Quarto Superior'
        };
        return tipos[tipo] || tipo || '—';
    };

    const getStatusText = (status) => {
        const statusMap = {
            confirmed: 'Concluída',
            cancelled: 'Cancelada',
            pending: 'Pendente',
            finalized: 'Finalizada'
        };
        return statusMap[status] || status || '—';
    };

    if (!historico || historico.length === 0) {
        return (
            <div className={styles.emptyHistorico}>
                <p>Nenhuma reserva no histórico</p>
            </div>
        );
    }

    return (
        <div className={styles.historicoContainer}>
            {/* Versão Desktop - Tabela */}
            <div className={styles.desktopView}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Acomodação</th>
                            <th>Datas</th>
                            <th>Status</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historico.map((reserva, index) => (
                            <tr key={reserva.id || index}>
                                <td data-label="Acomodação">{getTipoQuarto(reserva.room_type)}</td>
                                <td data-label="Datas">
                                    {formatarData(reserva.check_in)} – {formatarData(reserva.check_out)}
                                </td>
                                <td data-label="Status">
                                    <span className={`${styles.status} ${styles[reserva.status]}`}>
                                        {getStatusText(reserva.status)}
                                    </span>
                                </td>
                                <td data-label="Valor" className={styles.valorCell}>
                                    {formatarMoeda(reserva.total_price)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Versão Mobile - Cards */}
            <div className={styles.mobileView}>
                {historico.map((reserva, index) => (
                    <div key={reserva.id || index} className={styles.historicoCard}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardRoomType}>{getTipoQuarto(reserva.room_type)}</span>
                            <span className={`${styles.status} ${styles[reserva.status]}`}>
                                {getStatusText(reserva.status)}
                            </span>
                        </div>
                        <div className={styles.cardDates}>
                            <span className={styles.dateIcon}>📅</span>
                            {formatarData(reserva.check_in)} – {formatarData(reserva.check_out)}
                        </div>
                        <div className={styles.cardPrice}>
                            <span className={styles.priceLabel}>Valor total:</span>
                            <span className={styles.priceValue}>{formatarMoeda(reserva.total_price)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistoricoTable;