import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useI18n } from '../../../../../../contexts/I18nContext';
import styles from './QRCodeGenerator.module.css';

const QRCodeGenerator = ({ value, size = 120 }) => {
    const { t } = useI18n();
    
    if (!value) return null;
    
    const qrValue = `${window.location.origin}/validar-reserva/${value}`;
    
    const getTranslation = (key, defaultValue) => {
        const result = t(key);
        return typeof result === 'string' ? result : defaultValue;
    };
    
    return (
        <div className={styles.qrContainer}>
            <QRCodeSVG 
                value={qrValue} 
                size={size}
                level="H"
                includeMargin={true}
                className={styles.qrCode}
            />
            <p className={styles.qrLabel}>{getTranslation('qr.scan_validate', 'Escaneie para validar reserva')}</p>
        </div>
    );
};

export default QRCodeGenerator;
