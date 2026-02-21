// ============================================
// HOOK: useHomeData
// ============================================
// Responsabilidade: Hook customizado para a HomePage que combina
// dependências e lógica de dados
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { 
  useListAvailableRooms,
  useListServices,
  useCalculatePrice,
  usePricingService,
  useAvailabilityService
} from '../../../di/homeDependencies.js';
import { createLogger } from '../../../core/utils.js';

const logger = createLogger('useHomeData');

/**
 * Hook que gerencia os dados da HomePage
 * @returns {Object} Estado e funções da Home
 */
export const useHomeData = () => {
  // ==========================================
  // OBTER DEPENDÊNCIAS VIA HOOKS ESPECÍFICOS
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==========================================
  // FUNÇÕES DE CARREGAMENTO
  // ==========================================

  const loadRooms = useCallback(async () => {
    try {
      logger.debug('Carregando quartos...');
      const availableRooms = await listAvailableRooms.execute();
      setRooms(availableRooms);
      return availableRooms;
    } catch (err) {
      logger.error('Erro ao carregar quartos:', err);
      setError(err);
      return [];
    }
  }, [listAvailableRooms]);

  const loadServices = useCallback(async () => {
    try {
      logger.debug('Carregando serviços...');
      const servicesData = await listServices.execute();
      setServices(servicesData);
      return servicesData;
    } catch (err) {
      logger.error('Erro ao carregar serviços:', err);
      setError(err);
      return { categories: {} };
    }
  }, [listServices]);

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
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([loadRooms(), loadServices()]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [loadRooms, loadServices]);

  // ==========================================
  // RETORNO
  // ==========================================

  return {
    // Dados
    rooms,
    services,
    loading,
    error,

    // Funções de carregamento
    loadRooms,
    loadServices,

    // Funções de cálculo
    calculateReservationPrice,
    calculateServicesTotal,

    // Funções de disponibilidade
    checkAvailability
  };
};