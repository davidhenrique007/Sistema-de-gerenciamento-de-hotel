import React from 'react';
import styles from './Header.module.css';
import logo from '../../../../../../assets/images/logo.png';

const Header = ({ nomeCliente, totalReservas, totalGasto }) => {
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
                        <div className={styles.logoEmoji} style={{ display: 'none' }}>🏨</div>
                    </div>
                    <div className={styles.titleSection}>
                        <p className={styles.welcomeMessage}>BEM-VINDO À SUA ÁREA DE HÓSPEDE</p>
                        <h1 className={styles.title}>Minhas Reservas</h1>
                        <p className={styles.subtitle}>
                            Conforto, flexibilidade e controle total da sua reserva.
                        </p>
                    </div>
                </div>

                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Reservas Ativas</span>
                        <span className={styles.statValue}>{totalReservas}</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Total Gasto</span>
                        <span className={styles.statValue}>
                            {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(totalGasto)}
                        </span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Status</span>
                        <span className={styles.statValue}>Premium</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
