import React from 'react';
import FormQuarto from './FormQuarto';
import styles from './ModalQuarto.module.css';

const ModalQuarto = ({ isOpen, onClose, title, initialData, onSubmit, loading }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button onClick={onClose} className={styles.closeBtn}>×</button>
        </div>
        <div className={styles.modalBody}>
          <FormQuarto
            initialData={initialData}
            onSubmit={onSubmit}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default ModalQuarto;