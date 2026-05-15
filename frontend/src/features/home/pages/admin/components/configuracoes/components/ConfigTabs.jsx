import React from 'react';
import { useI18n } from '@/contexts/I18nContext';
import styles from './ConfigTabs.module.css';

const ConfigTabs = ({ activeTab, onTabChange }) => {
  const { t } = useI18n();

  const tabs = [
    { id: 'aparencia', label: t('configuracoes.aparencia', 'AparÃªncia'), icon: 'ðŸŽ¨' },
    { id: 'widgets', label: t('configuracoes.widgets', 'Widgets'), icon: 'ðŸ“Š' },
    { id: 'notificacoes', label: t('configuracoes.notificacoes', 'NotificaÃ§Ãµes'), icon: 'ðŸ””' },
    { id: 'seguranca', label: t('configuracoes.seguranca', 'SeguranÃ§a'), icon: 'ðŸ”’' },
    { id: 'sistema', label: t('configuracoes.sistema', 'Sistema'), icon: 'âš™ï¸' },
  ];

  return (
    <nav className={styles.tabsNav}>
      <div className={styles.tabsHeader}>
        <span className={styles.tabsLabel}>{t('configuracoes.menu', 'Menu')}</span>
      </div>
      <ul className={styles.tabsList}>
        {tabs.map((tab) => (
          <li key={tab.id} className={styles.tabsItem}>
            <button
              className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
              {activeTab === tab.id && <span className={styles.activeIndicator} />}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default ConfigTabs;
