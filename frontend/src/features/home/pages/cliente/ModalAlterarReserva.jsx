import React, { useState, useEffect } from 'react';
import api from '@services/api';
import styles from './styles/ModalReserva.module.css';

const ModalAlterarReserva = ({ reserva, onClose, onConfirm }) => {
    const [checkIn, setCheckIn] = useState(reserva.check_in.split('T')[0]);
    const [checkOut, setCheckOut] = useState(reserva.check_out.split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const hoje = new Date().toISOString().split('T')[0];
    
    const handleAlterar = async () => {
        setLoading(true);
        try {
            const response = await api.put(`/reservas/${reserva.id}/alterar`, {
                check_in: checkIn,
                check_out: checkOut
            });
            
            if (response.data.success) {
                onConfirm();
                onClose();
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao alterar');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Alterar Reserva</h2>
                    <button onClick={onClose}>×</button>
                </div>
                <div className={styles.modalContent}>
                    <div className={styles.formGroup}>
                        <label>Check-in</label>
                        <input
                            type="date"
                            value={checkIn}
                            min={hoje}
                            onChange={(e) => setCheckIn(e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Check-out</label>
                        <input
                            type="date"
                            value={checkOut}
                            min={checkIn}
                            onChange={(e) => setCheckOut(e.target.value)}
                        />
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                </div>
                <div className={styles.modalFooter}>
                    <button onClick={onClose}>Cancelar</button>
                    <button onClick={handleAlterar} disabled={loading}>
                        {loading ? 'Alterando...' : 'Confirmar alteração'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalAlterarReserva;
