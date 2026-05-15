// frontend/src/services/admin/widgetService.js

const STORAGE_KEY = 'dashboard_widgets';

export const getDefaultWidgets = () => ({
  revenueChart: true,
  occupancyChart: true,
  recentReservations: true,
  financialAlerts: false,
  pendingCheckIns: true,
  availableRooms: true,
  occupationForecast: false
});

export const loadWidgetPreferences = async () => {
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

export const saveWidgetPreferences = async (settings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Erro ao salvar preferências de widgets:', error);
  }
};

export const getWidgetMetadata = () => ({
  revenueChart: {
    id: 'revenueChart',
    name: 'Gráfico de Receita',
    description: 'Visualiza a receita diária e mensal do hotel',
    icon: '💰',
    defaultEnabled: true
  },
  occupancyChart: {
    id: 'occupancyChart',
    name: 'Taxa de Ocupação',
    description: 'Mostra a ocupação dos quartos em tempo real',
    icon: '📈',
    defaultEnabled: true
  },
  recentReservations: {
    id: 'recentReservations',
    name: 'Reservas Recentes',
    description: 'Lista as últimas reservas realizadas',
    icon: '📅',
    defaultEnabled: true
  },
  financialAlerts: {
    id: 'financialAlerts',
    name: 'Alertas Financeiros',
    description: 'Notificações sobre contas a receber e vencimentos',
    icon: '⚠️',
    defaultEnabled: false
  },
  pendingCheckIns: {
    id: 'pendingCheckIns',
    name: 'Check-ins Pendentes',
    description: 'Exibe check-ins agendados para hoje',
    icon: '🏨',
    defaultEnabled: true
  },
  availableRooms: {
    id: 'availableRooms',
    name: 'Quartos Disponíveis',
    description: 'Mostra quantidade de quartos livres por tipo',
    icon: '🛏️',
    defaultEnabled: true
  },
  occupationForecast: {
    id: 'occupationForecast',
    name: 'Previsão de Ocupação',
    description: 'Projeção de ocupação para os próximos dias',
    icon: '📊',
    defaultEnabled: false
  }
});

export default {
  getDefaultWidgets,
  loadWidgetPreferences,
  saveWidgetPreferences,
  getWidgetMetadata
};