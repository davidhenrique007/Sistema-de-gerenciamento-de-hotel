import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import styles from './IdiomaSelector.module.css';

const IdiomaSelector = () => {
  const { language, setLanguage, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'pt', name: 'PortuguÃªs', native: 'PortuguÃªs', flag: 'ðŸ‡µðŸ‡¹' },
    { code: 'en', name: 'English', native: 'English', flag: 'ðŸ‡¬ðŸ‡§' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('configuracoes.selecionar_idioma', 'Selecionar idioma')}
      >
        <span className={styles.triggerFlag}>{currentLanguage.flag}</span>
        <span className={styles.triggerLabel}>{currentLanguage.native}</span>
        <span className={`${styles.triggerArrow} ${isOpen ? styles.open : ''}`}>â–¼</span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`${styles.option} ${language === lang.code ? styles.active : ''}`}
              onClick={() => handleSelect(lang.code)}
            >
              <span className={styles.optionFlag}>{lang.flag}</span>
              <span className={styles.optionLabel}>{lang.native}</span>
              {language === lang.code && (
                <span className={styles.optionCheck}>âœ“</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default IdiomaSelector;
