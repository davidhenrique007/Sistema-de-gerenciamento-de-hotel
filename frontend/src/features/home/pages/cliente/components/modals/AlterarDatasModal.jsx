import React, { useState } from 'react';
import styles from './Modal.module.css';

const AlterarDatasModal = ({ reserva, onConfirm, onClose }) => {
    const [checkIn, setCheckIn] = useState(reserva.check_in?.split('T')[0] || '');
    const [checkOut, setCheckOut] = useState(reserva.check_out?.split('T')[0] || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const hoje = new Date().toISOString().split('T')[0];
    
    const handleConfirm = async () => {
        if (!checkIn || !checkOut) {
            setError('Preencha as datas');
            return;
        }
        
        if (new Date(checkOut) <= new Date(checkIn)) {
            setError('Check-out deve ser após check-in');
            return;
        }
        
        setLoading(true);
        try {
            await onConfirm(checkIn, checkOut);
        } catch (err) {
            setError(err.message || 'Erro ao alterar reserva');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Alterar Datas da Reserva</h2>
                    <button onClick={onClose} className={styles.closeButton}>×</button>
                </div>
                
                <div className={styles.modalBody}>
                    <p className={styles.reservaInfo}>
                        <strong>{reserva?.reservation_code}</strong><br />
                        Quarto {reserva?.room_number} - {reserva?.room_type}
                    </p>
                    
                    <div className={styles.formGroup}>
                        <label>Check-in</label>
                        <input
                            type="date"
                            value={checkIn}
                            min={hoje}
                            onChange={(e) => setCheckIn(e.target.value)}
                            className={styles.dateInput}
                        />
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label>Check-out</label>
                        <input
                            type="date"
                            value={checkOut}
                            min={checkIn || hoje}
                            onChange={(e) => setCheckOut(e.target.value)}
                            className={styles.dateInput}
                        />
                    </div>
                    
                    {error && <p className={styles.error}>{error}</p>}
                </div>
                
                <div className={styles.modalFooter}>
                    <button onClick={onClose} className={styles.cancelButton}>
                        Cancelar
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={loading}
                        className={styles.confirmButton}
                    >
                        {loading ? 'Alterando...' : 'Confirmar alteração'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlterarDatasModal;
