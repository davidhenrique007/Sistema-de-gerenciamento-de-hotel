import { useState, useCallback, useMemo } from 'react';

/**
 * Tipos de hóspedes suportados
 */
export const GUEST_TYPES = {
  ADULTS: 'adults',
  CHILDREN: 'children',
  BABIES: 'babies',
};

/**
 * Limites padrão por tipo de hóspede
 */
const DEFAULT_LIMITS = {
  [GUEST_TYPES.ADULTS]: { min: 1, max: 4 },
  [GUEST_TYPES.CHILDREN]: { min: 0, max: 3 },
  [GUEST_TYPES.BABIES]: { min: 0, max: 2 },
};

/**
 * Hook personalizado para gerenciar contagem de hóspedes
 * 
 * @param {Object} initialValues - Valores iniciais
 * @param {Object} limits - Limites personalizados
 * @returns {Object} Estado e funções do contador
 */
const useGuestCounter = (
  initialValues = { adults: 1, children: 0, babies: 0 },
  limits = DEFAULT_LIMITS
) => {
  // ==========================================================================
  // ESTADO
  // ==========================================================================

  const [guests, setGuests] = useState({
    adults: Math.max(limits.adults.min, Math.min(initialValues.adults, limits.adults.max)),
    children: Math.max(limits.children.min, Math.min(initialValues.children, limits.children.max)),
    babies: Math.max(limits.babies.min, Math.min(initialValues.babies, limits.babies.max)),
  });

  // ==========================================================================
  // CÁLCULOS DERIVADOS
  // ==========================================================================

  const totalGuests = useMemo(() => {
    return guests.adults + guests.children + guests.babies;
  }, [guests]);

  const hasReachedMin = useCallback(
    (type) => {
      return guests[type] <= limits[type].min;
    },
    [guests, limits]
  );

  const hasReachedMax = useCallback(
    (type) => {
      return guests[type] >= limits[type].max;
    },
    [guests, limits]
  );

  // ==========================================================================
  // FUNÇÕES DE INCREMENTO/DECREMENTO
  // ==========================================================================

  const incrementGuest = useCallback(
    (type) => {
      setGuests((prev) => {
        if (prev[type] >= limits[type].max) return prev;
        
        return {
          ...prev,
          [type]: prev[type] + 1,
        };
      });
    },
    [limits]
  );

  const decrementGuest = useCallback(
    (type) => {
      setGuests((prev) => {
        if (prev[type] <= limits[type].min) return prev;
        
        return {
          ...prev,
          [type]: prev[type] - 1,
        };
      });
    },
    [limits]
  );

  // ==========================================================================
  // FUNÇÕES UTILITÁRIAS
  // ==========================================================================

  const resetGuests = useCallback(() => {
    setGuests({
      adults: Math.max(limits.adults.min, initialValues.adults),
      children: Math.max(limits.children.min, initialValues.children),
      babies: Math.max(limits.babies.min, initialValues.babies),
    });
  }, [initialValues, limits]);

  const setGuestsByType = useCallback((type, value) => {
    setGuests((prev) => ({
      ...prev,
      [type]: value,
    }));
  }, []);

  const isValid = useCallback(() => {
    return totalGuests > 0 && totalGuests <= 10; // Limite total do hotel
  }, [totalGuests]);

  // ==========================================================================
  // RETORNO
  // ==========================================================================

  return {
    // Estado
    guests,
    totalGuests,
    
    // Funções de incremento/decremento
    incrementGuest,
    decrementGuest,
    
    // Utilitários
    resetGuests,
    setGuestsByType,
    hasReachedMin,
    hasReachedMax,
    isValid,
    
    // Dados adicionais
    limits,
  };
};

export default useGuestCounter;