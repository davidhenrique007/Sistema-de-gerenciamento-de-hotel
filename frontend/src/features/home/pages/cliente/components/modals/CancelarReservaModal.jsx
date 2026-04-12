// src/features/home/pages/cliente/components/modals/CancelarReservaModal.jsx
import React, { useState } from 'react';
import styles from './Modal.module.css';

const CancelarReservaModal = ({ reserva, onConfirm, onClose, loading }) => {
    const [motivo, setMotivo] = useState('');

    const handleConfirm = () => {
        if (motivo.trim()) {
            onConfirm(motivo);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Cancelar Reserva</h2>
                    <button onClick={onClose} className={styles.closeButton}>×</button>
                </div>
                
                <div className={styles.modalBody}>
                    <div className={styles.warningIcon}>⚠️</div>
                    <p className={styles.warningText}>
                        Tem certeza que deseja cancelar a reserva?
                    </p>
                    <p className={styles.reservaInfo}>
                        <strong>{reserva?.reservation_code}</strong><br />
                        Quarto {reserva?.room_number} - {reserva?.room_type}<br />
                        Período: {new Date(reserva?.check_in).toLocaleDateString()} a {new Date(reserva?.check_out).toLocaleDateString()}
                    </p>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="motivo">Motivo do cancelamento:</label>
                        <textarea
                            id="motivo"
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            placeholder="Por favor, informe o motivo do cancelamento..."
                            rows={3}
                        />
                    </div>
                </div>
                
                <div className={styles.modalFooter}>
                    <button onClick={onClose} className={styles.cancelButton}>
                        Voltar
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={!motivo.trim() || loading}
                        className={styles.confirmButton}
                    >
                        {loading ? 'Cancelando...' : 'Confirmar cancelamento'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelarReservaModal;