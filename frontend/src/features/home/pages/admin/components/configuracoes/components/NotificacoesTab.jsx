import React from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import styles from './NotificacoesTab.module.css';

const NotificacoesTab = () => {
  const { t } = useI18n();
  const { settings, toggleNotification, resetSettings, isNotificationEnabled } = useNotificationSettings();

  const notificationCategories = [
    {
      title: 'Reservas',
      icon: '📅',
      items: [
        { id: 'reservations', name: 'Novas reservas', description: 'Notifica quando uma nova reserva é criada' },
        { id: 'cancellations', name: 'Cancelamentos', description: 'Alerta quando uma reserva é cancelada' }
      ]
    },
    {
      title: 'Check-ins / Check-outs',
      icon: '🏨',
      items: [
        { id: 'checkIns', name: 'Check-ins pendentes', description: 'Notifica sobre check-ins agendados para hoje' },
        { id: 'checkOuts', name: 'Check-outs programados', description: 'Alerta sobre check-outs do dia' }
      ]
    },
    {
      title: 'Financeiro',
      icon: '💰',
      items: [
        { id: 'payments', name: 'Pagamentos recebidos', description: 'Notifica quando um pagamento é confirmado' },
        { id: 'pendingPayments', name: 'Pagamentos pendentes', description: 'Alerta sobre pagamentos em atraso' },
        { id: 'financialAlerts', name: 'Alertas financeiros', description: 'Notificações sobre contas e prazos' }
      ]
    },
    {
      title: 'Sistema',
      icon: '⚙️',
      items: [
        { id: 'maintenance', name: 'Manutenção de quartos', description: 'Notifica sobre quartos em manutenção' },
        { id: 'toastEnabled', name: 'Notificações Toast', description: 'Exibe notificações flutuantes na tela' },
        { id: 'soundEnabled', name: 'Sons de notificação', description: 'Reproduz som ao receber notificações' }
      ]
    }
  ];

  const enabledCount = Object.values(settings).filter(v => v === true).length;
  const totalCount = Object.keys(settings).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {t('configuracoes.preferencias_notificacoes', 'Preferências de Notificações')}
        </h2>
        <p className={styles.description}>
          {t('configuracoes.notificacoes_desc', 'Configure como e quando receber notificações')}
        </p>
        <div className={styles.stats}>
          <span className={styles.statsBadge}>
            {enabledCount} / {totalCount} {t('configuracoes.ativos', 'ativos')}
          </span>
          <button onClick={resetSettings} className={styles.resetButton}>
            {t('configuracoes.resetar_padrao', 'Resetar para padrão')}
          </button>
        </div>
      </div>

      <div className={styles.categoriesGrid}>
        {notificationCategories.map((category) => (
          <div key={category.title} className={styles.categoryCard}>
            <div className={styles.categoryHeader}>
              <span className={styles.categoryIcon}>{category.icon}</span>
              <h3 className={styles.categoryTitle}>{category.title}</h3>
            </div>
            <div className={styles.categoryItems}>
              {category.items.map((item) => (
                <div key={item.id} className={styles.notificationItem}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemDescription}>{item.description}</span>
                  </div>
                  <button
                    className={`${styles.toggle} ${settings[item.id] ? styles.toggleActive : ''}`}
                    onClick={() => toggleNotification(item.id)}
                    aria-label={settings[item.id] ? 'Desativar notificação' : 'Ativar notificação'}
                  >
                    <span className={styles.toggleSlider}>
                      <span className={styles.toggleKnob} />
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <p className={styles.footerText}>
          💡 {t('configuracoes.notificacoes_dica', 'As alterações são salvas automaticamente e aplicadas imediatamente')}
        </p>
      </div>
    </div>
  );
};

export default NotificacoesTab;