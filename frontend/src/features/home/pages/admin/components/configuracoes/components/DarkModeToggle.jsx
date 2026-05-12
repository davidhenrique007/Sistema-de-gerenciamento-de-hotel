import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import styles from './DarkModeToggle.module.css';

const DarkModeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { t } = useI18n();

  return (
    <div className={styles.wrapper}>
      <div className={styles.info}>
        <span className={styles.label}>
          {isDark 
            ? t('configuracoes.modo_escuro', 'Modo Escuro') 
            : t('configuracoes.modo_claro', 'Modo Claro')}
        </span>
        <span className={styles.status}>
          {isDark ? '🌙' : '☀️'}
        </span>
      </div>
      
      <button
        className={`${styles.toggle} ${isDark ? styles.active : ''}`}
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        role="switch"
        aria-checked={isDark}
      >
        <span className={styles.slider}>
          <span className={styles.knob}>
            {isDark ? '🌙' : '☀️'}
          </span>
        </span>
      </button>
    </div>
  );
};

export default DarkModeToggle;