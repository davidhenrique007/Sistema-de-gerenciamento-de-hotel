import React, { useState } from 'react';
import { FiX, FiAlertTriangle } from 'react-icons/fi';
import styles from './ModalCancelamento.module.css';

const ModalCancelamento = ({ isOpen, onClose, reserva, onSuccess }) => {
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (motivo.length < 10) {
      alert('Por favor, forneça um motivo com pelo menos 10 caracteres');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const reservaId = reserva.id || reserva.reservation_code;
      
      const response = await fetch(`http://localhost:5000/api/admin/reservas/${reservaId}/cancelar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ motivo })
      });

      const data = await response.json();
      if (data.success) {
        onSuccess();
        onClose();
        setMotivo('');
      } else {
        alert(data.message || 'Erro ao cancelar reserva');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao cancelar reserva');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.cancelModalOverlay}>
      <div className={styles.cancelModalContainer}>
        <div className={styles.cancelModalHeader}>
          <h2 className={styles.cancelModalTitle}>
            <FiAlertTriangle /> Cancelar Reserva
          </h2>
          <button onClick={onClose} className={styles.cancelModalClose}>
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.cancelModalBody}>
            <div className={styles.warningBox}>
              <p className={styles.warningText}>
                <strong>Atenção:</strong> Esta ação é irreversível. A reserva 
                <strong> #{reserva?.codigo_reserva || reserva?.reservation_code}</strong> de 
                <strong> {reserva?.cliente_nome || reserva?.guest_name}</strong> será cancelada.
              </p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Motivo do Cancelamento <span className={styles.requiredStar}>*</span>
              </label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows="4"
                className={styles.textarea}
                placeholder="Informe o motivo do cancelamento (mínimo 10 caracteres)..."
                required
              />
              <div className={styles.charCounter}>
                <span className={motivo.length < 10 && motivo.length > 0 ? styles.charCountWarning : ''}>
                  {motivo.length}/10 caracteres mínimos
                </span>
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              onClick={onClose}
              className={styles.btnBack}
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={loading || motivo.length < 10}
              className={styles.btnConfirm}
            >
              {loading ? 'Cancelando...' : 'Confirmar Cancelamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCancelamento;
