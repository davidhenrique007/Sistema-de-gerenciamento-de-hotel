import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import styles from './QRCodeGenerator.module.css';

const QRCodeGenerator = ({ value, size = 120 }) => {
    if (!value) return null;
    
    // URL para validação da reserva
    const qrValue = `${window.location.origin}/validar-reserva/${value}`;
    
    return (
        <div className={styles.qrContainer}>
            <QRCodeSVG 
                value={qrValue} 
                size={size}
                level="H"
                includeMargin={true}
                className={styles.qrCode}
            />
            <p className={styles.qrLabel}>Escaneie para validar reserva</p>
        </div>
    );
};

export default QRCodeGenerator;
