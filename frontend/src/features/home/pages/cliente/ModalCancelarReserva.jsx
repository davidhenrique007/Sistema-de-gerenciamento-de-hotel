import React, { useState } from 'react';
import api from '@services/api';
import styles from './styles/ModalReserva.module.css';

const ModalCancelarReserva = ({ reserva, onClose, onConfirm }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const handleCancelar = async () => {
        setLoading(true);
        try {
            const response = await api.put(`/reservas/${reserva.id}/cancelar`, {
                motivo: 'Cancelamento solicitado pelo cliente'
            });
            
            if (response.data.success) {
                onConfirm();
                onClose();
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao cancelar');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Cancelar Reserva</h2>
                    <button onClick={onClose}>×</button>
                </div>
                <div className={styles.modalContent}>
                    <p>Tem certeza que deseja cancelar a reserva <strong>{reserva.reservation_code}</strong>?</p>
                    <p>Quarto {reserva.room_number} - {reserva.room_type}</p>
                    <p>Período: {new Date(reserva.check_in).toLocaleDateString()} a {new Date(reserva.check_out).toLocaleDateString()}</p>
                    {error && <p className={styles.error}>{error}</p>}
                </div>
                <div className={styles.modalFooter}>
                    <button onClick={onClose}>Voltar</button>
                    <button onClick={handleCancelar} disabled={loading}>
                        {loading ? 'Cancelando...' : 'Confirmar cancelamento'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalCancelarReserva;
