/**
 * Hook React para sincronizar estado com localStorage
 * @module useLocalStorage
 */

import { useState, useEffect, useCallback } from 'react';
import { localStorageWrapper } from '../utils/storage.js';
import { ValidationError } from '../utils/errorUtils.js';

/**
 * Hook para persistir estado no localStorage
 * @param {string} key - Chave para armazenamento
 * @param {*} initialValue - Valor inicial
 * @param {Object} options - Opções
 * @returns {[*, Function, Function]} [value, setValue, removeValue]
 */
export const useLocalStorage = (key, initialValue, options = {}) => {
  const {
    serialize = true,
    deserialize = true,
    syncAcrossTabs = false
  } = options;

  // Estado inicial
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Tentar recuperar do storage
      const item = localStorageWrapper.getItem(key, {
        deserialize,
        defaultValue: null
      });

      if (item !== null) {
        return item;
      }

      // Se não existe, usar valor inicial
      if (initialValue !== undefined) {
        localStorageWrapper.setItem(key, initialValue, { serialize });
        return initialValue;
      }

      return null;
    } catch (error) {
      console.warn(`Erro ao inicializar useLocalStorage para chave "${key}":`, error);
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
  });

  // Função para atualizar valor
  const setValue = useCallback((value) => {
    try {
      // Permitir valor como função
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Salvar no estado
      setStoredValue(valueToStore);

      // Salvar no storage
      localStorageWrapper.setItem(key, valueToStore, { serialize });
    } catch (error) {
      console.error(`Erro ao salvar chave "${key}" no localStorage:`, error);
      throw new ValidationError('Erro ao persistir dados', {
        key,
        originalError: error.message
      });
    }
  }, [key, storedValue, serialize]);

  // Função para remover valor
  const removeValue = useCallback(() => {
    try {
      localStorageWrapper.removeItem(key);
      setStoredValue(undefined);
    } catch (error) {
      console.error(`Erro ao remover chave "${key}" do localStorage:`, error);
    }
  }, [key]);

  // Sincronizar entre abas (opcional)
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = (event) => {
      if (event.key === key) {
        try {
          const newValue = event.newValue
            ? (deserialize ? JSON.parse(event.newValue) : event.newValue)
            : null;

          setStoredValue(newValue);
        } catch (error) {
          console.warn('Erro ao processar evento de storage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserialize, syncAcrossTabs]);

  return [storedValue, setValue, removeValue];
};

/**
 * Hook para persistir estado no sessionStorage
 * @param {string} key - Chave para armazenamento
 * @param {*} initialValue - Valor inicial
 * @returns {[*, Function, Function]} [value, setValue, removeValue]
 */
export const useSessionStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Erro ao ler sessionStorage:`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Erro ao salvar no sessionStorage:`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      sessionStorage.removeItem(key);
      setStoredValue(undefined);
    } catch (error) {
      console.error(`Erro ao remover do sessionStorage:`, error);
    }
  }, [key]);

  return [storedValue, setValue, removeValue];
};