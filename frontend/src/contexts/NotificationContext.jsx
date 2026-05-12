import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'notification_preferences';

const getDefaultSettings = () => ({
  reservations: true,
  payments: true,
  pendingPayments: true,
  cancellations: true,
  checkIns: true,
  checkOuts: true,
  financialAlerts: true,
  maintenance: false,
  toastEnabled: true,
  soundEnabled: false
});

const loadSettings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return getDefaultSettings();
  } catch (error) {
    console.error('Erro ao carregar preferências de notificações:', error);
    return getDefaultSettings();
  }
};

const saveSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Erro ao salvar preferências de notificações:', error);
  }
};

const NotificationContext = createContext({});

export const NotificationProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSettings(loadSettings());
    setLoading(false);
  }, []);

  const toggleNotification = useCallback((key) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: !prev[key] };
      saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  const enableNotification = useCallback((key) => {
    setSettings(prev => {
      if (prev[key]) return prev;
      const newSettings = { ...prev, [key]: true };
      saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  const disableNotification = useCallback((key) => {
    setSettings(prev => {
      if (!prev[key]) return prev;
      const newSettings = { ...prev, [key]: false };
      saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  const resetSettings = useCallback(() => {
    const defaultSettings = getDefaultSettings();
    setSettings(defaultSettings);
    saveSettings(defaultSettings);
  }, []);

  const isNotificationEnabled = useCallback((key) => {
    return settings[key] ?? true;
  }, [settings]);

  const shouldShowToast = useCallback(() => {
    return settings.toastEnabled ?? true;
  }, [settings]);

  const shouldPlaySound = useCallback(() => {
    return settings.soundEnabled ?? false;
  }, [settings]);

  const value = {
    settings,
    loading,
    toggleNotification,
    enableNotification,
    disableNotification,
    resetSettings,
    isNotificationEnabled,
    shouldShowToast,
    shouldPlaySound
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export default NotificationContext;