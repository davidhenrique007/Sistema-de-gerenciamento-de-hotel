import React, { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import ConfigTabs from './components/ConfigTabs';
import AparenciaTab from './components/AparenciaTab';
import WidgetsTab from './components/WidgetsTab';
import NotificacoesTab from './components/NotificacoesTab';
import SegurancaTab from './components/SegurancaTab';
import SistemaTab from './components/SistemaTab';
import styles from './Configuracoes.module.css';

const Configuracoes = () => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('aparencia');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'aparencia':
        return <AparenciaTab />;
      case 'widgets':
        return <WidgetsTab />;
      case 'notificacoes':
        return <NotificacoesTab />;
      case 'seguranca':
        return <SegurancaTab />;
      case 'sistema':
        return <SistemaTab />;
      default:
        return <AparenciaTab />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'aparencia':
        return t('configuracoes.aparencia', 'Aparência');
      case 'widgets':
        return t('configuracoes.widgets', 'Widgets');
      case 'notificacoes':
        return t('configuracoes.notificacoes', 'Notificações');
      case 'seguranca':
        return t('configuracoes.seguranca', 'Segurança');
      case 'sistema':
        return t('configuracoes.sistema', 'Sistema');
      default:
        return t('configuracoes.title', 'Configurações');
    }
  };

  return (
    <div className={styles.configuracoesContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          {t('configuracoes.title', 'Configurações do Sistema')}
        </h1>
        <p className={styles.pageDescription}>
          {t('configuracoes.description', 'Gerencie as preferências e configurações do painel administrativo')}
        </p>
      </div>

      <div className={styles.configContent}>
        <aside className={styles.tabsSidebar}>
          <ConfigTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </aside>

        <main className={styles.tabContent}>
          <div className={styles.tabHeader}>
            <h2 className={styles.tabTitle}>{getPageTitle()}</h2>
            <p className={styles.tabDescription}>
              {t(`configuracoes.${activeTab}_description`, 'Configure as opções relacionadas a esta seção')}
            </p>
          </div>
          <div className={styles.tabBody}>
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Configuracoes;