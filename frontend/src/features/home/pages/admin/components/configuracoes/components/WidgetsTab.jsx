import React from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useWidgetSettings } from '@/hooks/useWidgetSettings';
import styles from './WidgetsTab.module.css';

const WidgetsTab = () => {
  const { t } = useI18n();
  const { widgets, toggleWidget, resetWidgets } = useWidgetSettings();

  const widgetList = [
    { id: 'revenueChart', name: 'Gráfico de Receita', description: 'Visualiza a receita diária e mensal do hotel', icon: '💰' },
    { id: 'occupancyChart', name: 'Taxa de Ocupação', description: 'Mostra a ocupação dos quartos em tempo real', icon: '📈' },
    { id: 'recentReservations', name: 'Reservas Recentes', description: 'Lista as últimas reservas realizadas', icon: '📅' },
    { id: 'financialAlerts', name: 'Alertas Financeiros', description: 'Notificações sobre contas a receber e vencimentos', icon: '⚠️' },
    { id: 'pendingCheckIns', name: 'Check-ins Pendentes', description: 'Exibe check-ins agendados para hoje', icon: '🏨' },
    { id: 'availableRooms', name: 'Quartos Disponíveis', description: 'Mostra quantidade de quartos livres por tipo', icon: '🛏️' },
    { id: 'occupationForecast', name: 'Previsão de Ocupação', description: 'Projeção de ocupação para os próximos dias', icon: '📊' }
  ];

  const enabledCount = widgetList.filter(w => widgets[w.id]).length;
  const totalCount = widgetList.length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {t('configuracoes.widgets_dashboard', 'Widgets do Dashboard')}
        </h2>
        <p className={styles.description}>
          {t('configuracoes.widgets_desc', 'Configure quais widgets aparecem no dashboard principal')}
        </p>
        <div className={styles.stats}>
          <span className={styles.statsBadge}>
            {enabledCount} / {totalCount} {t('configuracoes.ativos', 'ativos')}
          </span>
          <button onClick={resetWidgets} className={styles.resetButton}>
            {t('configuracoes.resetar_padrao', 'Resetar para padrão')}
          </button>
        </div>
      </div>

      <div className={styles.widgetsGrid}>
        {widgetList.map((widget) => (
          <div key={widget.id} className={styles.widgetCard}>
            <div className={styles.widgetHeader}>
              <span className={styles.widgetIcon}>{widget.icon}</span>
              <div className={styles.widgetInfo}>
                <h3 className={styles.widgetName}>{widget.name}</h3>
                <p className={styles.widgetDescription}>{widget.description}</p>
              </div>
              <button
                className={`${styles.toggle} ${widgets[widget.id] ? styles.toggleActive : ''}`}
                onClick={() => toggleWidget(widget.id)}
                aria-label={widgets[widget.id] ? 'Desativar widget' : 'Ativar widget'}
              >
                <span className={styles.toggleSlider}>
                  <span className={styles.toggleKnob} />
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <p className={styles.footerText}>
          💡 {t('configuracoes.widgets_dica', 'As alterações são salvas automaticamente e aplicadas em tempo real no dashboard')}
        </p>
      </div>
    </div>
  );
};

export default WidgetsTab;
