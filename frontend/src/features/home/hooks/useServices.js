import { useState, useEffect, useMemo, useCallback } from 'react';
import servicesData, { getServicesByCategory, serviceCategories } from '../data/servicesData';

/**
 * Hook personalizado para gerenciar serviços do hotel
 * 
 * @param {Object} options - Opções de configuração
 * @returns {Object} Estado e funções dos serviços
 */
const useServices = (options = {}) => {
  const {
    initialCategory = 'all',
    simulateLoading = false,
  } = options;

  // ==========================================================================
  // ESTADO
  // ==========================================================================

  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [isLoading, setIsLoading] = useState(simulateLoading);
  const [error, setError] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);

  // ==========================================================================
  // CARREGAR SERVIÇOS (SIMULA API)
  // ==========================================================================

  useEffect(() => {
    const loadServices = async () => {
      if (!simulateLoading) {
        setServices(servicesData);
        return;
      }

      try {
        setIsLoading(true);
        // Simular chamada de API
        await new Promise(resolve => setTimeout(resolve, 800));
        setServices(servicesData);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar serviços. Tente novamente.');
        console.error('[useServices] Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
  }, [simulateLoading]);

  // ==========================================================================
  // SERVIÇOS FILTRADOS POR CATEGORIA
  // ==========================================================================

  const filteredServices = useMemo(() => {
    return getServicesByCategory(selectedCategory);
  }, [selectedCategory]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const toggleService = useCallback((serviceId) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  }, []);

  const selectService = useCallback((serviceId) => {
    setSelectedServices(prev => {
      if (!prev.includes(serviceId)) {
        return [...prev, serviceId];
      }
      return prev;
    });
  }, []);

  const deselectService = useCallback((serviceId) => {
    setSelectedServices(prev => prev.filter(id => id !== serviceId));
  }, []);

  const clearSelectedServices = useCallback(() => {
    setSelectedServices([]);
  }, []);

  // ==========================================================================
  // SERVIÇOS SELECIONADOS (DETALHADOS)
  // ==========================================================================

  const selectedServicesDetails = useMemo(() => {
    return services.filter(service => selectedServices.includes(service.id));
  }, [services, selectedServices]);

  // ==========================================================================
  // TOTAL DOS SERVIÇOS SELECIONADOS
  // ==========================================================================

  const selectedServicesTotal = useMemo(() => {
    return selectedServicesDetails.reduce((sum, service) => sum + service.price, 0);
  }, [selectedServicesDetails]);

  // ==========================================================================
  // RETORNO
  // ==========================================================================

  return {
    // Dados
    services,
    filteredServices,
    selectedServices,
    selectedServicesDetails,
    selectedServicesTotal,
    
    // Estado
    isLoading,
    error,
    
    // Categorias
    categories: serviceCategories,
    selectedCategory,
    
    // Handlers
    handleCategoryChange,
    toggleService,
    selectService,
    deselectService,
    clearSelectedServices,
  };
};

export default useServices;