import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'dashboard_widgets';

const getDefaultWidgets = () => ({
  revenueChart: true,
  occupancyChart: true,
  recentReservations: true,
  financialAlerts: false,
  pendingCheckIns: true,
  availableRooms: true,
  occupationForecast: false
});

const loadWidgetPreferences = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return getDefaultWidgets();
  } catch (error) {
    console.error('Erro ao carregar preferências de widgets:', error);
    return getDefaultWidgets();
  }
};

const saveWidgetPreferences = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Erro ao salvar preferências de widgets:', error);
  }
};

const WidgetContext = createContext({});

export const WidgetProvider = ({ children }) => {
  const [widgets, setWidgets] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWidgets = () => {
      try {
        const savedWidgets = loadWidgetPreferences();
        setWidgets(savedWidgets);
      } catch (error) {
        console.error('Erro ao carregar widgets:', error);
        setWidgets(getDefaultWidgets());
      } finally {
        setLoading(false);
      }
    };
    loadWidgets();
  }, []);

  const toggleWidget = useCallback((widgetId) => {
    setWidgets(prev => {
      const newState = { ...prev, [widgetId]: !prev[widgetId] };
      saveWidgetPreferences(newState);
      return newState;
    });
  }, []);

  const resetWidgets = useCallback(() => {
    const defaultWidgets = getDefaultWidgets();
    setWidgets(defaultWidgets);
    saveWidgetPreferences(defaultWidgets);
  }, []);

  const isWidgetEnabled = useCallback((widgetId) => {
    return widgets[widgetId] ?? true;
  }, [widgets]);

  const value = {
    widgets,
    loading,
    toggleWidget,
    resetWidgets,
    isWidgetEnabled
  };

  return (
    <WidgetContext.Provider value={value}>
      {children}
    </WidgetContext.Provider>
  );
};

export const useWidgets = () => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidgets must be used within WidgetProvider');
  }
  return context;
};

export default WidgetContext;