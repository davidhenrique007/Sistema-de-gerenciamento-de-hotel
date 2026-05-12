import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNotificationSettings } from '../../../hooks/useNotificationSettings';
import Toast from '../Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const { shouldShowToast, isNotificationEnabled } = useNotificationSettings();

  const addToast = useCallback(({ message, title, type = 'info', duration = 5000, notificationKey = null }) => {
    // Verificar se a notificação está habilitada
    if (notificationKey && !isNotificationEnabled(notificationKey)) {
      return null;
    }
    
    // Verificar se toasts estão habilitados globalmente
    if (!shouldShowToast()) {
      return null;
    }
    
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, title, type, duration }]);
    return id;
  }, [isNotificationEnabled, shouldShowToast]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message, title = 'Sucesso', duration = 4000, notificationKey = null) => {
    return addToast({ message, title, type: 'success', duration, notificationKey });
  }, [addToast]);

  const showError = useCallback((message, title = 'Erro', duration = 6000, notificationKey = null) => {
    return addToast({ message, title, type: 'error', duration, notificationKey });
  }, [addToast]);

  const showWarning = useCallback((message, title = 'Atenção', duration = 5000, notificationKey = null) => {
    return addToast({ message, title, type: 'warning', duration, notificationKey });
  }, [addToast]);

  const showInfo = useCallback((message, title = 'Informação', duration = 4000, notificationKey = null) => {
    return addToast({ message, title, type: 'info', duration, notificationKey });
  }, [addToast]);

  const showErrorFromException = useCallback((error, notificationKey = null) => {
    const { tratarErro } = require('../../utils/tratamentoErros');
    const erroTratado = tratarErro(error);
    return addToast({
      message: erroTratado.message || erroTratado.mensagem,
      title: erroTratado.title || erroTratado.titulo,
      type: erroTratado.type || 'error',
      duration: 6000,
      notificationKey
    });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{
      addToast,
      removeToast,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      showErrorFromException
    }}>
      {children}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            title={toast.title}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};