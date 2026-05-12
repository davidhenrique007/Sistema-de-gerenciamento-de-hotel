import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'hotel_currency';

export const availableCurrencies = [
  { code: 'MZN', symbol: 'MT', name: 'Metical', locale: 'pt-MZ', rate: 1 },
  { code: 'USD', symbol: '$', name: 'Dólar Americano', locale: 'en-US', rate: 0.015 },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE', rate: 0.014 },
  { code: 'ZAR', symbol: 'R', name: 'Rand', locale: 'en-ZA', rate: 0.28 }
];

const CurrencyContext = createContext({});

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState('MZN');

  useEffect(() => {
    const savedCurrency = localStorage.getItem(STORAGE_KEY);
    if (savedCurrency && availableCurrencies.some(c => c.code === savedCurrency)) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  const setCurrency = useCallback((newCurrency) => {
    if (availableCurrencies.some(c => c.code === newCurrency)) {
      setCurrencyState(newCurrency);
      localStorage.setItem(STORAGE_KEY, newCurrency);
    }
  }, []);

  const getCurrencyInfo = useCallback(() => {
    return availableCurrencies.find(c => c.code === currency) || availableCurrencies[0];
  }, [currency]);

  const formatCurrency = useCallback((value) => {
    const info = getCurrencyInfo();
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numericValue)) return `0 ${info.symbol}`;
    
    return new Intl.NumberFormat(info.locale, {
      style: 'currency',
      currency: info.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numericValue);
  }, [currency, getCurrencyInfo]);

  const convertCurrency = useCallback((value, targetCurrency) => {
    const sourceInfo = getCurrencyInfo();
    const targetInfo = availableCurrencies.find(c => c.code === targetCurrency);
    
    if (!targetInfo) return value;
    
    const valueInMZN = value / sourceInfo.rate;
    return valueInMZN * targetInfo.rate;
  }, [currency, getCurrencyInfo]);

  const value = {
    currency,
    setCurrency,
    formatCurrency,
    convertCurrency,
    getCurrencyInfo,
    availableCurrencies
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};

export default CurrencyContext;