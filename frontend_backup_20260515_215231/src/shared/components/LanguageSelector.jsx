import React from 'react';
import { useI18n } from '../../contexts/I18nContext';
import styles from './LanguageSelector.module.css';

const LanguageSelector = () => {
  const { language, setLanguage, supportedLanguages } = useI18n();

  const languages = {
    pt: { label: 'Português', flag: '🇵🇹', short: 'PT' },
    en: { label: 'English', flag: '🇬🇧', short: 'EN' }
  };

  return (
    <div className={styles.selector}>
      {supportedLanguages.map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={`${styles.langButton} ${language === lang ? styles.active : ''}`}
          title={languages[lang]?.label}
        >
          <span className={styles.flag}>{languages[lang]?.flag}</span>
          <span className={styles.short}>{languages[lang]?.short}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
