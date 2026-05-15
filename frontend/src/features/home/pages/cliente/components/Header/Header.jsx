import React from 'react';
import { useI18n } from '@/contexts/I18nContext';
import styles from './Header.module.css';
import logo from '../../../../../../assets/images/logo.png';

const Header = ({ nomeCliente, totalReservas, totalGasto }) => {
    const { t } = useI18n();

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

    return (
        <div className={styles.header}>
            <div className={styles.headerContent}>
                <div className={styles.headerTop}>
                    <div className={styles.logoContainer}>
                        <div className={styles.logoCircle}></div>
                        <img 
                            src={logo} 
                            alt="Hotel Paradise" 
                            className={styles.logo}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = 'block';
                                }
                            }}
                        />
                        <div className={styles.logoEmoji} style={{ display: 'none' }}>??</div>
                    </div>
                    <div className={styles.titleSection}>
                        <p className={styles.welcomeMessage}>
                            {getTranslation('guest_area.welcome', 'BEM-VINDO � SUA �REA DE H�SPEDE')}
                        </p>
                        <h1 className={styles.title}>{getTranslation('nav.reservations', 'Minhas Reservas')}</h1>
                        <p className={styles.subtitle}>
                            {getTranslation('guest_area.subtitle', 'Conforto, flexibilidade e controle total da sua reserva.')}
                        </p>
                    </div>
                </div>

                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>{getTranslation('guest_area.active_reservations', 'Reservas Ativas')}</span>
                        <span className={styles.statValue}>{totalReservas}</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>{getTranslation('guest_area.total_spent', 'Total Gasto')}</span>
                        <span className={styles.statValue}>{formatarMoeda(totalGasto)}</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>{getTranslation('guest_area.status', 'Status')}</span>
                        <span className={styles.statValue}>{getTranslation('guest_area.premium', 'Premium')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;

