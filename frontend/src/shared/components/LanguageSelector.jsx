import React from 'react';
import { useI18n } from '../../contexts/I18nContext';
import styles from './LanguageSelector.module.css';

const LanguageSelector = () => {
  const { language, setLanguage, supportedLanguages } = useI18n();
  
  const languageNames = {
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
          title={languageNames[lang]?.label}
        >
          <span className={styles.flag}>{languageNames[lang]?.flag}</span>
          <span className={styles.short}>{languageNames[lang]?.short}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;