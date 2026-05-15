import React from 'react';
import { useI18n } from '@/contexts/I18nContext';
import styles from './PolicySection.module.css';

const PolicySection = () => {
    const { t } = useI18n();

    const getTranslation = (key, defaultValue) => {
        const result = t(key);
        return typeof result === 'string' ? result : defaultValue;
    };

    return (
        <div className={styles.policySection}>
            <h3 className={styles.policyTitle}>{getTranslation('policy.cancellation_policy', 'Política de Cancelamento')}</h3>
            <p className={styles.policyText}>
                [OK] {getTranslation('policy.free_cancellation', 'Cancelamento grátis até 24h antes do check-in.')}
            </p>
            <div className={styles.reciboActions}>
                <h4>{getTranslation('receipt.resend', 'Reenviar Recibo')}:</h4>
                <button className={styles.reciboEmail}>{getTranslation('receipt.email_receipt', 'Enviar por E-mail')}</button>
                <button className={styles.reciboWhatsapp}>{getTranslation('receipt.share_whatsapp', 'Enviar via WhatsApp')}</button>
            </div>
        </div>
    );
};

export default PolicySection;
