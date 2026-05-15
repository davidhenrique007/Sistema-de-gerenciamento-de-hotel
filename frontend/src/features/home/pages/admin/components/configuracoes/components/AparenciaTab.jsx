import React from 'react';
import { useI18n } from '@/contexts/I18nContext';
import DarkModeToggle from './DarkModeToggle';
import IdiomaSelector from './IdiomaSelector';
import styles from './AparenciaTab.module.css';

const AparenciaTab = () => {
  const { t } = useI18n();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {t('configuracoes.aparencia', 'AparÃªncia')}
        </h2>
        <p className={styles.description}>
          {t('configuracoes.tema_desc', 'Personalize a aparÃªncia do painel administrativo')}
        </p>
      </div>

      <div className={styles.settingsGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>ðŸŒ™</div>
            <div>
              <h3 className={styles.cardTitle}>
                {t('configuracoes.tema_visual', 'Tema Visual')}
              </h3>
              <p className={styles.cardDescription}>
                {t('configuracoes.tema_desc_short', 'Alterne entre modo claro e escuro')}
              </p>
            </div>
          </div>
          <div className={styles.cardContent}>
            <DarkModeToggle />
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>ðŸŒ</div>
            <div>
              <h3 className={styles.cardTitle}>
                {t('configuracoes.idioma', 'Idioma')}
              </h3>
              <p className={styles.cardDescription}>
                {t('configuracoes.idioma_desc', 'Escolha o idioma da interface')}
              </p>
            </div>
          </div>
          <div className={styles.cardContent}>
            <IdiomaSelector />
          </div>
        </div>

        <div className={`${styles.card} ${styles.comingSoon}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>ðŸŽ¨</div>
            <div>
              <h3 className={styles.cardTitle}>
                {t('configuracoes.cores_personalizadas', 'Cores Personalizadas')}
              </h3>
              <p className={styles.cardDescription}>
                {t('configuracoes.cores_desc', 'Em breve vocÃª poderÃ¡ personalizar as cores do sistema')}
              </p>
            </div>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.comingSoonBadge}>
              {t('configuracoes.em_breve', 'Em breve')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AparenciaTab;
