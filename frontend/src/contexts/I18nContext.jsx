import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import ptTranslations from '../locales/pt.json';
import enTranslations from '../locales/en.json';

// Mapeamento de traduções
const translations = {
  pt: ptTranslations,
  en: enTranslations
};

// Idiomas suportados
const SUPPORTED_LANGUAGES = ['pt', 'en'];
const DEFAULT_LANGUAGE = 'pt';
const STORAGE_KEY = 'hotel_language';

// Detectar idioma do navegador
const detectBrowserLanguage = () => {
  const browserLang = navigator.language?.split('-')[0].toLowerCase();
  return SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : DEFAULT_LANGUAGE;
};

// Obter idioma inicial
const getInitialLanguage = () => {
  // 1. Verificar localStorage
  const savedLang = localStorage.getItem(STORAGE_KEY);
  if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang)) {
    return savedLang;
  }
  
  // 2. Detectar idioma do navegador
  return detectBrowserLanguage();
};

// Criar contexto
const I18nContext = createContext(null);

// Provider
export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState(getInitialLanguage);
  
  // Função de tradução
  const t = useCallback((key) => {
    if (!key || typeof key !== 'string') return '';
    
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (!value || !value[k]) {
        console.warn(`⚠️ Translation key not found: ${key}`);
        return key; // Fallback para a própria chave
      }
      value = value[k];
    }
    
    return value;
  }, [language]);
  
  // Mudar idioma
  const changeLanguage = useCallback((newLang) => {
    if (!SUPPORTED_LANGUAGES.includes(newLang)) {
      console.warn(`⚠️ Language not supported: ${newLang}`);
      return;
    }
    
    setLanguage(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
    
    // Disparar evento para outros componentes
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: newLang }));
  }, []);
  
  // Efeito para sincronizar com o localStorage em outras abas
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && e.newValue && SUPPORTED_LANGUAGES.includes(e.newValue)) {
        setLanguage(e.newValue);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const value = {
    language,
    setLanguage: changeLanguage,
    t,
    supportedLanguages: SUPPORTED_LANGUAGES,
    isRTL: language === 'ar' // Preparado para futuro RTL
  };
  
  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

// Hook personalizado
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};