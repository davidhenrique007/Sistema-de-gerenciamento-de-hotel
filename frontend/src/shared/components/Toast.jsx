import React, { useState, useEffect, useCallback } from 'react';
import styles from './Toast.module.css';

const Toast = ({ message, title, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  if (!isVisible) return null;

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const icon = icons[type] || icons.info;

  return (
    <div className={`${styles.toast} ${styles[type]} ${isLeaving ? styles.leaving : ''}`}>
      <div className={styles.toastIcon}>{icon}</div>
      <div className={styles.toastContent}>
        {title && <div className={styles.toastTitle}>{title}</div>}
        <div className={styles.toastMessage}>{message}</div>
      </div>
      <button className={styles.toastClose} onClick={handleClose} aria-label="Fechar">
        ✕
      </button>
    </div>
  );
};

export default Toast;
