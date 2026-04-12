import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = ({ onVoltar, voltarParaCheckout = false }) => {
    const navigate = useNavigate();

    const handleVoltar = () => {
        if (voltarParaCheckout) {
            navigate('/checkout');
        } else if (onVoltar) {
            onVoltar();
        } else {
            navigate('/');
        }
    };

    return (
        <div className={styles.footer}>
            <div className={styles.footerContent}>
                <button onClick={handleVoltar} className={styles.backButton}>
                    ← Voltar para {voltarParaCheckout ? 'Checkout' : 'Home'}
                </button>
                <p className={styles.copyright}>
                    © {new Date().getFullYear()} Hotel Paradise. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
};

export default Footer;
