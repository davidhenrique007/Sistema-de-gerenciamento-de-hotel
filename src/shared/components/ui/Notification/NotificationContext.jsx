import React, { createContext, useReducer, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

export const NOTIFICATION_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
};

const NOTIFICATION_DEFAULTS = {
  DURATION: 5000,
  MAX_STACK: 5,
  POSITION: NOTIFICATION_POSITIONS.TOP_RIGHT,
};

// ============================================================================
// ACTION TYPES
// ============================================================================

const ACTION_TYPES = {
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_ALL: 'CLEAR_ALL',
};

// ============================================================================
// REDUCER PURO (FÁCIL DE TESTAR)
// ============================================================================

const initialState = {
  notifications: [],
  maxStack: NOTIFICATION_DEFAULTS.MAX_STACK,
  position: NOTIFICATION_DEFAULTS.POSITION,
};

const notificationReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.ADD_NOTIFICATION: {
      // Manter apenas as últimas N notificações
      const updatedNotifications = [
        action.payload,
        ...state.notifications,
      ].slice(0, state.maxStack);

      return {
        ...state,
        notifications: updatedNotifications,
      };
    }

    case ACTION_TYPES.REMOVE_NOTIFICATION: {
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification.id !== action.payload
        ),
      };
    }

    case ACTION_TYPES.CLEAR_ALL: {
      return {
        ...state,
        notifications: [],
      };
    }

    default:
      return state;
  }
};

// ============================================================================
// CONTEXT
// ============================================================================

export const NotificationContext = createContext(null);
NotificationContext.displayName = 'NotificationContext';

// ============================================================================
// PROVIDER
// ============================================================================

let notificationCounter = 0;

export const NotificationProvider = ({ 
  children, 
  maxStack = NOTIFICATION_DEFAULTS.MAX_STACK,
  position = NOTIFICATION_DEFAULTS.POSITION,
}) => {
  const [state, dispatch] = useReducer(notificationReducer, {
    ...initialState,
    maxStack,
    position,
  });
  
  // Referência para armazenar timeouts (evita memory leaks)
  const timeoutsRef = useRef(new Map());

  // ==========================================================================
  // LIMPEZA DE TIMEOUTS
  // ==========================================================================

  const clearNotificationTimeout = useCallback((notificationId) => {
    const timeoutId = timeoutsRef.current.get(notificationId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(notificationId);
    }
  }, []);

  // ==========================================================================
  // REMOVER NOTIFICAÇÃO
  // ==========================================================================

  const removeNotification = useCallback((notificationId) => {
    clearNotificationTimeout(notificationId);
    dispatch({ type: ACTION_TYPES.REMOVE_NOTIFICATION, payload: notificationId });
  }, [clearNotificationTimeout]);

  // ==========================================================================
  // ADICIONAR NOTIFICAÇÃO
  // ==========================================================================

  const addNotification = useCallback(({ 
    type = NOTIFICATION_TYPES.INFO, 
    message, 
    duration = NOTIFICATION_DEFAULTS.DURATION,
    position: notificationPosition,
  }) => {
    const id = `notification-${Date.now()}-${notificationCounter++}`;
    
    const notification = {
      id,
      type,
      message,
      duration,
      position: notificationPosition || state.position,
      timestamp: Date.now(),
    };

    dispatch({ type: ACTION_TYPES.ADD_NOTIFICATION, payload: notification });

    if (duration > 0) {
      const timeoutId = setTimeout(() => {
        removeNotification(id);
      }, duration);

      timeoutsRef.current.set(id, timeoutId);
    }

    return id;
  }, [removeNotification, state.position]);

  // ==========================================================================
  // NOTIFICATION HELPERS
  // ==========================================================================

  const notifySuccess = useCallback((message, duration, position) => 
    addNotification({ type: NOTIFICATION_TYPES.SUCCESS, message, duration, position }), 
  [addNotification]);

  const notifyError = useCallback((message, duration, position) => 
    addNotification({ type: NOTIFICATION_TYPES.ERROR, message, duration, position }), 
  [addNotification]);

  const notifyWarning = useCallback((message, duration, position) => 
    addNotification({ type: NOTIFICATION_TYPES.WARNING, message, duration, position }), 
  [addNotification]);

  const notifyInfo = useCallback((message, duration, position) => 
    addNotification({ type: NOTIFICATION_TYPES.INFO, message, duration, position }), 
  [addNotification]);

  // ==========================================================================
  // LIMPAR TODAS NOTIFICAÇÕES
  // ==========================================================================

  const clearAllNotifications = useCallback(() => {
    timeoutsRef.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    timeoutsRef.current.clear();
    dispatch({ type: ACTION_TYPES.CLEAR_ALL });
  }, []);

  // ==========================================================================
  // CLEANUP NO UNMOUNT
  // ==========================================================================

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      timeoutsRef.current.clear();
    };
  }, []);

  // ==========================================================================
  // CONTEXT VALUE (MEMOIZADO)
  // ==========================================================================

  const contextValue = React.useMemo(
    () => ({
      notifications: state.notifications,
      position: state.position,
      addNotification,
      removeNotification,
      clearAllNotifications,
      notifySuccess,
      notifyError,
      notifyWarning,
      notifyInfo,
    }),
    [
      state.notifications,
      state.position,
      addNotification,
      removeNotification,
      clearAllNotifications,
      notifySuccess,
      notifyError,
      notifyWarning,
      notifyInfo,
    ]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
  maxStack: PropTypes.number,
  position: PropTypes.oneOf(Object.values(NOTIFICATION_POSITIONS)),
};

NotificationProvider.defaultProps = {
  maxStack: NOTIFICATION_DEFAULTS.MAX_STACK,
  position: NOTIFICATION_DEFAULTS.POSITION,
};