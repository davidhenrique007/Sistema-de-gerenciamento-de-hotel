import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';
import styles from './Footer.module.css';

const Footer = ({ onVoltar, voltarParaCheckout = false }) => {
    const navigate = useNavigate();
    const { t } = useI18n();

    const getTranslation = (key, defaultValue) => {
        const result = t(key);
        return typeof result === 'string' ? result : defaultValue;
    };

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
                    ← {getTranslation('common.back_to', 'Voltar para')} {voltarParaCheckout ? getTranslation('checkout.title', 'Checkout') : getTranslation('nav.home', 'Home')}
                </button>
                <p className={styles.copyright}>
                    © {new Date().getFullYear()} Hotel Paradise. {getTranslation('footer.rights', 'Todos os direitos reservados')}.
                </p>
            </div>
        </div>
    );
};

export default Footer;