// ============================================
// HOOK: useHomeData
// ============================================
// Responsabilidade: Gerenciar dados da HomePage
// Integra hooks de DI com lógica de estado
// VERSÃO CORRIGIDA - COM loadRoomDetails
// ============================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  useListAvailableRooms,
  useListServices,
  useCalculatePrice,
  usePricingService,
  useAvailabilityService
} from '../../../di/homeDependencies.jsx';
import { createLogger } from '../../../core/utils.js';

const logger = createLogger('useHomeData');

// ============================================
// HOOK PRINCIPAL
// ============================================

export const useHomeData = ({
  // Configurações
  autoLoad = true,
  enableCache = true,
  
  // Callbacks
  onError,
  onSuccess
} = {}) => {
  // ==========================================
  // OBTER DEPENDÊNCIAS VIA HOOKS DE DI
  // ==========================================
  const listAvailableRooms = useListAvailableRooms();
  const listServices = useListServices();
  const calculatePrice = useCalculatePrice();
  const pricingService = usePricingService();
  const availabilityService = useAvailabilityService();

  // ==========================================
  // ESTADO LOCAL
  // ==========================================
  const [rooms, setRooms] = useState([]);
  const [services, setServices] = useState({ categories: {} });
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);

  // ==========================================
  // DADOS DERIVADOS
  // ==========================================
  
  const availableRooms = useMemo(() => {
    return rooms.filter(room => room.available);
  }, [rooms]);

  const featuredRooms = useMemo(() => {
    return rooms.slice(0, 3);
  }, [rooms]);

  const stats = useMemo(() => {
    return {
      totalRooms: rooms.length,
      availableRooms: availableRooms.length,
      totalServices: Object.keys(services.categories || {}).length
    };
  }, [rooms.length, availableRooms.length, services.categories]);

  // ==========================================
  // FUNÇÕES DE CARREGAMENTO
  // ==========================================

  const loadRooms = useCallback(async () => {
    try {
      logger.debug('Carregando quartos...');
      const availableRooms = await listAvailableRooms.execute();
      setRooms(availableRooms);
      
      if (onSuccess) onSuccess('rooms', availableRooms);
      
      return availableRooms;
    } catch (err) {
      logger.error('Erro ao carregar quartos:', err);
      setError(err);
      
      if (onError) onError('rooms', err);
      
      return [];
    }
  }, [listAvailableRooms, onSuccess, onError]);

  const loadServices = useCallback(async () => {
    try {
      logger.debug('Carregando serviços...');
      const servicesData = await listServices.execute();
      setServices(servicesData);
      
      if (onSuccess) onSuccess('services', servicesData);
      
      return servicesData;
    } catch (err) {
      logger.error('Erro ao carregar serviços:', err);
      setError(err);
      
      if (onError) onError('services', err);
      
      return { categories: {} };
    }
  }, [listServices, onSuccess, onError]);

  // ✅ NOVA FUNÇÃO: loadRoomDetails
  const loadRoomDetails = useCallback(async (roomId) => {
    try {
      logger.debug(`Carregando detalhes do quarto ${roomId}...`);
      // Como não temos um hook específico, retornamos o quarto da lista
      const room = rooms.find(r => r.id === roomId);
      return room || null;
    } catch (err) {
      logger.error(`Erro ao carregar detalhes do quarto ${roomId}:`, err);
      return null;
    }
  }, [rooms]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([loadRooms(), loadServices()]);
      setInitialized(true);
    } catch (err) {
      // Erros já são tratados individualmente
    } finally {
      setLoading(false);
    }
  }, [loadRooms, loadServices]);

  // ==========================================
  // FUNÇÕES DE REFRESH
  // ==========================================

  const refresh = useCallback(() => {
    loadAll();
  }, [loadAll]);

  const refreshRooms = useCallback(() => {
    loadRooms();
  }, [loadRooms]);

  const refreshServices = useCallback(() => {
    loadServices();
  }, [loadServices]);

  // ==========================================
  // FUNÇÕES DE CÁLCULO
  // ==========================================

  const calculateReservationPrice = useCallback(async (roomId, checkIn, checkOut, guests, serviceIds) => {
    try {
      logger.debug('Calculando preço da reserva...');
      const price = await calculatePrice.execute({
        roomId,
        dateRange: { checkIn, checkOut },
        guestsCount: guests,
        serviceIds
      });
      return price;
    } catch (err) {
      logger.error('Erro ao calcular preço:', err);
      throw err;
    }
  }, [calculatePrice]);

  const calculateServicesTotal = useCallback((services, nights, guests) => {
    try {
      return pricingService.calculateServicesPrice(services, nights, guests);
    } catch (err) {
      logger.error('Erro ao calcular total de serviços:', err);
      return { total: 0 };
    }
  }, [pricingService]);

  // ==========================================
  // FUNÇÕES DE DISPONIBILIDADE
  // ==========================================

  const checkAvailability = useCallback(async (roomId, checkIn, checkOut, guests) => {
    try {
      logger.debug('Verificando disponibilidade...');
      const result = await availabilityService.checkAvailability({
        roomId,
        dateRange: { checkIn, checkOut },
        guestsCount: guests
      });
      return result;
    } catch (err) {
      logger.error('Erro ao verificar disponibilidade:', err);
      return { isAvailable: false, reason: err.message };
    }
  }, [availabilityService]);

  // ==========================================
  // CARREGAMENTO INICIAL
  // ==========================================

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      if (!autoLoad) return;
      
      setLoading(true);
      try {
        await Promise.all([loadRooms(), loadServices()]);
        if (isMounted) setInitialized(true);
      } catch (err) {
        if (isMounted) {
          logger.error('Erro na inicialização:', err);
          setError(err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]);

  // ==========================================
  // RETORNO
  // ==========================================

  return {
    // Dados
    rooms,
    availableRooms,
    featuredRooms,
    services,
    stats,
    
    // Estados
    loading,
    initialized,
    error,
    
    // Funções de carregamento
    loadRooms,
    loadServices,
    loadAll,
    loadRoomDetails, // ✅ ADICIONADO!
    
    // Funções de refresh
    refresh,
    refreshRooms,
    refreshServices,
    
    // Funções de cálculo
    calculateReservationPrice,
    calculateServicesTotal,
    
    // Funções de disponibilidade
    checkAvailability
  };
};

// ============================================
// HOOK: useHomePageData (versão específica)
// ============================================

export const useHomePageData = (options = {}) => {
  const homeData = useHomeData(options);
  
  // Dados específicos para a HomePage
  const heroRooms = homeData.featuredRooms;
  const heroServices = homeData.services?.categories?.featured || [];
  
  return {
    ...homeData,
    heroRooms,
    heroServices
  };
};