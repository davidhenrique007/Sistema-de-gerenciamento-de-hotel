import React from 'react';
import styles from './HeaderCheckout.module.css';
import { Link } from 'react-router-dom';

const HeaderCheckout = ({ isIdentificado = false }) => {
    return (
        <div className={styles.header}>
            <div className={styles.headerContent}>
                <div className={styles.headerTop}>
                    <div className={styles.logoContainer}>
                        <div className={styles.logoCircle}></div>
                        <div className={styles.logoEmoji}>🏨</div>
                    </div>
                    <div className={styles.titleSection}>
                        <p className={styles.welcomeMessage}>HOTEL PARADISE</p>
                        <h1 className={styles.title}>Bem Vindo ao Checkout</h1>
                        <p className={styles.subtitle}>
                            Obrigado por escolher-nos! Confirme sua reserva
                        </p>
                    </div>
                </div>

                <div className={styles.headerActions}>
                    <Link to="/" className={styles.backButton}>
                        ← Voltar
                    </Link>
                    {isIdentificado && (
                        <Link to="/minhas-reservas" className={styles.minhasReservasButton}>
                            📋 Minhas Reservas
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HeaderCheckout;
