import { useContext } from 'react';
import { NotificationContext } from './NotificationContext';

/**
 * Hook personalizado para acessar o sistema de notificações
 * 
 * @throws {Error} Se usado fora de NotificationProvider
 * @returns {Object} Métodos de notificação
 * 
 * @example
 * const { notifySuccess, notifyError } = useNotification();
 * notifySuccess('Operação realizada com sucesso!');
 */
const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider. ' +
      'Please wrap your component tree with NotificationProvider.'
    );
  }

  return {
    /** Lista de notificações ativas */
    notifications: context.notifications,
    
    /** Posição atual das notificações */
    position: context.position,
    
    /** Adiciona notificação de sucesso */
    notifySuccess: (message, duration, position) => 
      context.notifySuccess(message, duration, position),
    
    /** Adiciona notificação de erro */
    notifyError: (message, duration, position) => 
      context.notifyError(message, duration, position),
    
    /** Adiciona notificação de aviso */
    notifyWarning: (message, duration, position) => 
      context.notifyWarning(message, duration, position),
    
    /** Adiciona notificação informativa */
    notifyInfo: (message, duration, position) => 
      context.notifyInfo(message, duration, position),
    
    /** Remove notificação específica por ID */
    removeNotification: context.removeNotification,
    
    /** Remove todas as notificações */
    clearAllNotifications: context.clearAllNotifications,
    
    /** Adiciona notificação customizada */
    addNotification: context.addNotification,
  };
};

export default useNotification;