import React from 'react';
import styles from './PolicySection.module.css';

const PolicySection = () => {
    return (
        <div className={styles.policySection}>
            <h3 className={styles.policyTitle}>Política de Cancelamento</h3>
            <p className={styles.policyText}>
                ✓ Cancelamento grátis até 24h antes do check-in.
            </p>
            <div className={styles.reciboActions}>
                <h4>Reenviar Recibo:</h4>
                <button className={styles.reciboEmail}>Enviar por E-mail</button>
                <button className={styles.reciboWhatsapp}>Enviar via WhatsApp</button>
            </div>
        </div>
    );
};

export default PolicySection;