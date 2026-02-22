// ============================================
// COMPONENT: Notification
// ============================================
// Responsabilidade: Sistema de notificações toast
// Acessibilidade: role="alert", aria-live="assertive"
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import styles from './Notification.module.css';

// ============================================
// CONSTANTES
// ============================================

export const NotificationType = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

export const NotificationPosition = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  TOP_CENTER: 'top-center',
  BOTTOM_CENTER: 'bottom-center'
};

const DEFAULT_DURATION = 5000; // 5 segundos
const ANIMATION_DURATION = 300; // 300ms para animações

// ============================================
// ÍCONES POR TIPO
// ============================================

const icons = {
  [NotificationType.SUCCESS]: '✓',
  [NotificationType.ERROR]: '✗',
  [NotificationType.INFO]: 'ℹ',
  [NotificationType.WARNING]: '⚠'
};

// ============================================
// COMPONENTE: Notification Item
// ============================================

const NotificationItem = ({
  id,
  type = NotificationType.INFO,
  title,
  message,
  duration = DEFAULT_DURATION,
  onClose,
  position = NotificationPosition.TOP_RIGHT
}) => {
  const [isExiting, setIsExiting] = useState(false);

  // ========================================
  // AUTO-DISMISS
  // ========================================
  
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  // ========================================
  // HANDLERS
  // ========================================
  
  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, ANIMATION_DURATION);
  }, [id, onClose]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  // ========================================
  // CLASSES
  // ========================================
  
  const notificationClasses = [
    styles.notification,
    styles[type],
    styles[position.split('-')[0]], // top ou bottom
    isExiting && styles.exiting
  ].filter(Boolean).join(' ');

  // ========================================
  // RENDER
  // ========================================
  
  return (
    <div
      className={notificationClasses}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className={styles.content}>
        <div className={styles.icon} aria-hidden="true">
          {icons[type]}
        </div>
        
        <div className={styles.textContent}>
          {title && <h4 className={styles.title}>{title}</h4>}
          <p className={styles.message}>{message}</p>
        </div>
        
        <button
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Fechar notificação"
        >
          ×
        </button>
      </div>
      
      {/* Barra de progresso */}
      {duration > 0 && (
        <div 
          className={styles.progressBar}
          style={{ animationDuration: `${duration}ms` }}
        />
      )}
    </div>
  );
};

// ============================================
// COMPONENTE: Notification Container
// ============================================

export const NotificationContainer = ({
  notifications = [],
  position = NotificationPosition.TOP_RIGHT,
  onClose
}) => {
  if (!notifications.length) return null;

  const containerClasses = [
    styles.container,
    styles[position]
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} aria-live="polite" aria-atomic="false">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          {...notification}
          position={position}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

// ============================================
// NOTIFICATION PROVIDER
// ============================================

export const NotificationContext = React.createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const show = useCallback(({ type, title, message, duration }) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    
    setNotifications(prev => [...prev, {
      id,
      type,
      title,
      message,
      duration
    }]);

    return id;
  }, []);

  const success = useCallback((message, options = {}) => {
    return show({
      type: NotificationType.SUCCESS,
      message,
      ...options
    });
  }, [show]);

  const error = useCallback((message, options = {}) => {
    return show({
      type: NotificationType.ERROR,
      message,
      ...options
    });
  }, [show]);

  const info = useCallback((message, options = {}) => {
    return show({
      type: NotificationType.INFO,
      message,
      ...options
    });
  }, [show]);

  const warning = useCallback((message, options = {}) => {
    return show({
      type: NotificationType.WARNING,
      message,
      ...options
    });
  }, [show]);

  const close = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const closeAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    show,
    success,
    error,
    info,
    warning,
    close,
    closeAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer
        notifications={notifications}
        onClose={close}
      />
    </NotificationContext.Provider>
  );
};

// ============================================
// HOOK PARA USAR NOTIFICAÇÕES
// ============================================

export const useNotification = () => {
  const context = React.useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de NotificationProvider');
  }
  
  return context;
};

// ============================================
// COMPONENTE PRINCIPAL (para uso direto)
// ============================================

export const Notification = ({
  type = NotificationType.INFO,
  title,
  message,
  duration = DEFAULT_DURATION,
  onClose,
  show = true
}) => {
  if (!show) return null;

  return (
    <NotificationItem
      id="single"
      type={type}
      title={title}
      message={message}
      duration={duration}
      onClose={() => onClose?.()}
    />
  );
};