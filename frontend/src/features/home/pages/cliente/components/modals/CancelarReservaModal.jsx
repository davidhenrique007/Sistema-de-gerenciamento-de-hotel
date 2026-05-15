import React, { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { formatDate } from '@/core/utils/dateFormatter';
import styles from './Modal.module.css';

const CancelarReservaModal = ({ reserva, onConfirm, onClose, loading }) => {
    const { t, language } = useI18n();
    const [motivo, setMotivo] = useState('');

    const getTranslation = (key, defaultValue) => {
        const result = t(key);
        return typeof result === 'string' ? result : defaultValue;
    };

    const handleConfirm = () => {
        if (motivo.trim()) {
            onConfirm(motivo);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{getTranslation('reservation.cancel', 'Cancelar Reserva')}</h2>
                    <button onClick={onClose} className={styles.closeButton}>X</button>
                </div>
                
                <div className={styles.modalBody}>
                    <div className={styles.warningIcon}>[!]</div>
                    <p className={styles.warningText}>
                        {getTranslation('reservation.cancel_confirm', 'Tem certeza que deseja cancelar a reserva?')}
                    </p>
                    <p className={styles.reservaInfo}>
                        <strong>{reserva?.reservation_code}</strong><br />
                        {getTranslation('rooms.room', 'Quarto')} {reserva?.room_number} - {reserva?.room_type}<br />
                        {getTranslation('reservation.period', 'Período')}: {formatDate(reserva?.check_in, language)} a {formatDate(reserva?.check_out, language)}
                    </p>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="motivo">{getTranslation('reservation.cancel_reason', 'Motivo do cancelamento')}:</label>
                        <textarea
                            id="motivo"
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            placeholder={getTranslation('reservation.cancel_reason_placeholder', 'Por favor, informe o motivo do cancelamento...')}
                            rows={3}
                        />
                    </div>
                </div>
                
                <div className={styles.modalFooter}>
                    <button onClick={onClose} className={styles.cancelButton}>
                        {getTranslation('common.back', 'Voltar')}
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={!motivo.trim() || loading}
                        className={styles.confirmButton}
                    >
                        {loading ? getTranslation('common.cancelling', 'Cancelando...') : getTranslation('common.confirm_cancel', 'Confirmar cancelamento')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelarReservaModal;
