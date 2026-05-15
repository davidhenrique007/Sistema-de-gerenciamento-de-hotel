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
      icon: 'ðŸ“…',
      items: [
        { id: 'reservations', name: 'Novas reservas', description: 'Notifica quando uma nova reserva Ã© criada' },
        { id: 'cancellations', name: 'Cancelamentos', description: 'Alerta quando uma reserva Ã© cancelada' }
      ]
    },
    {
      title: 'Check-ins / Check-outs',
      icon: 'ðŸ¨',
      items: [
        { id: 'checkIns', name: 'Check-ins pendentes', description: 'Notifica sobre check-ins agendados para hoje' },
        { id: 'checkOuts', name: 'Check-outs programados', description: 'Alerta sobre check-outs do dia' }
      ]
    },
    {
      title: 'Financeiro',
      icon: 'ðŸ’°',
      items: [
        { id: 'payments', name: 'Pagamentos recebidos', description: 'Notifica quando um pagamento Ã© confirmado' },
        { id: 'pendingPayments', name: 'Pagamentos pendentes', description: 'Alerta sobre pagamentos em atraso' },
        { id: 'financialAlerts', name: 'Alertas financeiros', description: 'NotificaÃ§Ãµes sobre contas e prazos' }
      ]
    },
    {
      title: 'Sistema',
      icon: 'âš™ï¸',
      items: [
        { id: 'maintenance', name: 'ManutenÃ§Ã£o de quartos', description: 'Notifica sobre quartos em manutenÃ§Ã£o' },
        { id: 'toastEnabled', name: 'NotificaÃ§Ãµes Toast', description: 'Exibe notificaÃ§Ãµes flutuantes na tela' },
        { id: 'soundEnabled', name: 'Sons de notificaÃ§Ã£o', description: 'Reproduz som ao receber notificaÃ§Ãµes' }
      ]
    }
  ];

  const enabledCount = Object.values(settings).filter(v => v === true).length;
  const totalCount = Object.keys(settings).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {t('configuracoes.preferencias_notificacoes', 'PreferÃªncias de NotificaÃ§Ãµes')}
        </h2>
        <p className={styles.description}>
          {t('configuracoes.notificacoes_desc', 'Configure como e quando receber notificaÃ§Ãµes')}
        </p>
        <div className={styles.stats}>
          <span className={styles.statsBadge}>
            {enabledCount} / {totalCount} {t('configuracoes.ativos', 'ativos')}
          </span>
          <button onClick={resetSettings} className={styles.resetButton}>
            {t('configuracoes.resetar_padrao', 'Resetar para padrÃ£o')}
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
                    aria-label={settings[item.id] ? 'Desativar notificaÃ§Ã£o' : 'Ativar notificaÃ§Ã£o'}
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
          ðŸ’¡ {t('configuracoes.notificacoes_dica', 'As alteraÃ§Ãµes sÃ£o salvas automaticamente e aplicadas imediatamente')}
        </p>
      </div>
    </div>
  );
};

export default NotificacoesTab;
