// ============================================
// HOOK: useHomeData (VERSÃO COM LOGS EXTENSIVOS)
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

// Mapeamento de tipos para labels amigáveis (fallback)
const TYPE_LABELS = {
  standard: 'Standard',
  deluxe: 'Deluxe',
  executive: 'Executivo',
  family: 'Família',
  presidential: 'Presidencial'
};

// ============================================
// HOOK PRINCIPAL
// ============================================

export const useHomeData = ({
  autoLoad = true,
  enableCache = true,
  onError,
  onSuccess
} = {}) => {
  // ==========================================
  // OBTER DEPENDÊNCIAS VIA HOOKS DE DI
  // ==========================================
  console.log('🔍 [useHomeData] Inicializando...');

  const listAvailableRooms = useListAvailableRooms();
  console.log('🔍 [useHomeData] listAvailableRooms:', listAvailableRooms);

  const listServices = useListServices();
  console.log('🔍 [useHomeData] listServices:', listServices);

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
    return rooms.filter(room => room.status === 'AVAILABLE');
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

  // ============================================
  // FUNÇÃO PARA ENRIQUECER DADOS DOS QUARTOS - A
  // ============================================

  const enrichRoomData = useCallback((room) => {
    console.log('💰 [enrichRoomData] Processando quarto:', room?.id, room?.number);
    console.log('💰 [enrichRoomData] pricePerNight original:', room?.pricePerNight);

    // 🚨 IGNORAR COMPLETAMENTE O VALOR DO REPOSITÓRIO
    // USAR SEMPRE OS VALORES FIXOS POR NÚMERO DE QUARTO

    const fixedPrices = {
      '01': 3000,
      '10': 4000,
      '20': 4000,  // ← AGORA 4000
      '25': 5000,
      '30': 7000,
      '35': 12000
    };

    // PEGAR O VALOR FIXO BASEADO NO NÚMERO DO QUARTO
    const fixedAmount = fixedPrices[room.number] || 3000;
    const currency = 'MZN';

    console.log('💰 Usando valor FIXO:', fixedAmount, 'para o quarto', room.number);

    // Formatação manual
    let formattedPrice;
    if (fixedAmount >= 1000) {
      const thousands = Math.floor(fixedAmount / 1000);
      const remainder = fixedAmount % 1000;
      formattedPrice = thousands + '.' + remainder.toString().padStart(3, '0') + ' ' + currency;
    } else {
      formattedPrice = fixedAmount + ' ' + currency;
    }

    console.log('💰 [enrichRoomData] Preço formatado (FIXO):', formattedPrice);

    return {
      id: room.id,
      number: room.number,
      type: room.type,
      typeLabel: room.typeLabel || TYPE_LABELS[room.type] || room.type,
      capacity: room.capacity,
      pricePerNight: { amount: fixedAmount, currency }, // ← USAR O FIXO
      pricePerNightFormatted: formattedPrice,
      status: room.status,
      available: room.status === 'AVAILABLE',
      amenities: room.amenities || [],
      mainImage: room.mainImage || `/assets/images/rooms/${room.type}/main.jpg`
    };
  }, []);

  const loadRooms = useCallback(async () => {
    console.log('📥 [useHomeData] ===== INICIANDO loadRooms =====');

    try {
      // 1. Verificar se o use case existe
      console.log('📥 [useHomeData] Verificando listAvailableRooms:', listAvailableRooms);

      if (!listAvailableRooms) {
        console.error('❌ [useHomeData] listAvailableRooms é null ou undefined');
        return [];
      }

      // 2. Verificar se tem método execute
      console.log('📥 [useHomeData] listAvailableRooms tem execute?', typeof listAvailableRooms.execute === 'function');

      if (typeof listAvailableRooms.execute !== 'function') {
        console.error('❌ [useHomeData] listAvailableRooms.execute não é uma função');
        return [];
      }

      // 3. Executar o use case
      console.log('📥 [useHomeData] Chamando listAvailableRooms.execute()...');
      const rawRooms = await listAvailableRooms.execute();

      console.log('📥 [useHomeData] RESULTADO CRU:', rawRooms);
      console.log('📥 [useHomeData] É array?', Array.isArray(rawRooms));
      console.log('📥 [useHomeData] Tamanho:', rawRooms?.length);

      // 4. Verificar se rawRooms é array
      if (!Array.isArray(rawRooms)) {
        console.error('❌ [useHomeData] rawRooms não é array:', rawRooms);
        return [];
      }

      // 5. Se veio vazio, tentar dados mock diretamente
      if (rawRooms.length === 0) {
        console.warn('⚠️ [useHomeData] rawRooms veio vazio! Usando dados mock diretamente');

        // Importar dados mock diretamente (solução de emergência)
        const { roomsData } = await import('../../../data/roomsData.js');
        console.log('📥 [useHomeData] roomsData importado:', roomsData);

        const enrichedRooms = roomsData.map(room => enrichRoomData(room));
        console.log('📤 [useHomeData] rooms enriquecidos (mock):', enrichedRooms);

        setRooms(enrichedRooms);
        return enrichedRooms;
      }

      // 6. Enriquecer dados
      console.log('📥 [useHomeData] Enriquecendo dados...');
      const enrichedRooms = rawRooms.map(room => {
        console.log('🔍 [useHomeData] Enriquecendo room:', room.id, room.number);
        return enrichRoomData(room);
      });

      console.log('📤 [useHomeData] enrichedRooms FINAL:', enrichedRooms);
      console.log('📤 [useHomeData] Primeiro quarto formatado:', enrichedRooms[0]?.pricePerNightFormatted);

      // 7. Atualizar estado
      setRooms(enrichedRooms);

      if (onSuccess) onSuccess('rooms', enrichedRooms);

      return enrichedRooms;

    } catch (err) {
      console.error('❌ [useHomeData] ERRO em loadRooms:', err);
      console.error('❌ [useHomeData] Stack:', err.stack);

      setError(err);
      if (onError) onError('rooms', err);

      return [];
    } finally {
      console.log('📥 [useHomeData] ===== FIM loadRooms =====');
    }
  }, [listAvailableRooms, enrichRoomData, onSuccess, onError]);

  const loadServices = useCallback(async () => {
    console.log('📥 [useHomeData] Carregando serviços...');
    try {
      const servicesData = await listServices.execute();
      console.log('📥 [useHomeData] Serviços carregados:', servicesData);
      setServices(servicesData);
      return servicesData;
    } catch (err) {
      console.error('❌ [useHomeData] Erro ao carregar serviços:', err);
      return { categories: {} };
    }
  }, [listServices]);

  const loadRoomDetails = useCallback(async (roomId) => {
    console.log(`📥 [useHomeData] Carregando detalhes do quarto ${roomId}...`);
    const room = rooms.find(r => r.id === roomId);
    return room ? enrichRoomData(room) : null;
  }, [rooms, enrichRoomData]);

  const loadAll = useCallback(async () => {
    console.log('🚀 [useHomeData] loadAll iniciado');
    setLoading(true);
    setError(null);

    try {
      await Promise.all([loadRooms(), loadServices()]);
      setInitialized(true);
    } catch (err) {
      console.error('❌ [useHomeData] Erro em loadAll:', err);
    } finally {
      setLoading(false);
    }
  }, [loadRooms, loadServices]);

  // ==========================================
  // FUNÇÕES DE REFRESH
  // ==========================================

  const refresh = useCallback(() => {
    console.log('🔄 [useHomeData] refresh chamado');
    loadAll();
  }, [loadAll]);

  const refreshRooms = useCallback(() => {
    console.log('🔄 [useHomeData] refreshRooms chamado');
    loadRooms();
  }, [loadRooms]);

  const refreshServices = useCallback(() => {
    console.log('🔄 [useHomeData] refreshServices chamado');
    loadServices();
  }, [loadServices]);

  // ==========================================
  // FUNÇÕES DE CÁLCULO
  // ==========================================

  const calculateReservationPrice = useCallback(async (roomId, checkIn, checkOut, guests, serviceIds) => {
    try {
      const price = await calculatePrice.execute({
        roomId,
        dateRange: { checkIn, checkOut },
        guestsCount: guests,
        serviceIds
      });
      return price;
    } catch (err) {
      console.error('❌ [useHomeData] Erro ao calcular preço:', err);
      throw err;
    }
  }, [calculatePrice]);

  const calculateServicesTotal = useCallback((services, nights, guests) => {
    try {
      return pricingService.calculateServicesPrice(services, nights, guests);
    } catch (err) {
      console.error('❌ [useHomeData] Erro ao calcular total de serviços:', err);
      return { total: 0 };
    }
  }, [pricingService]);

  // ==========================================
  // FUNÇÕES DE DISPONIBILIDADE
  // ==========================================

  const checkAvailability = useCallback(async (roomId, checkIn, checkOut, guests) => {
    try {
      const result = await availabilityService.checkAvailability({
        roomId,
        dateRange: { checkIn, checkOut },
        guestsCount: guests
      });
      return result;
    } catch (err) {
      console.error('❌ [useHomeData] Erro ao verificar disponibilidade:', err);
      return { isAvailable: false, reason: err.message };
    }
  }, [availabilityService]);

  // ==========================================
  // CARREGAMENTO INICIAL
  // ==========================================

  // ==========================================
  // CARREGAMENTO INICIAL - VERSÃO CORRIGIDA
  // ==========================================
  useEffect(() => {
    console.log('🎯 [useHomeData] useEffect - autoLoad:', autoLoad);

    let isMounted = true;
    let hasLoaded = false; // ← Controla se já carregou

    const initialize = async () => {
      console.log('🎯 [useHomeData] initialize executando...');

      if (!autoLoad) {
        console.log('🎯 [useHomeData] autoLoad false, não carregando');
        return;
      }

      // ⚠️ IMPEDIR CARREGAMENTO DUPLICADO
      if (hasLoaded) {
        console.log('🎯 [useHomeData] hasLoaded true, ignorando');
        return;
      }

      if (initialized) {
        console.log('🎯 [useHomeData] initialized true, ignorando');
        return;
      }

      setLoading(true);
      try {
        console.log('🎯 [useHomeData] Chamando loadRooms()...');
        const roomsResult = await loadRooms();
        console.log('🎯 [useHomeData] loadRooms resultado:', roomsResult);

        console.log('🎯 [useHomeData] Chamando loadServices()...');
        await loadServices();

        if (isMounted) {
          hasLoaded = true; // ← MARCA QUE CARREGOU
          setInitialized(true);
          console.log('✅ [useHomeData] Inicialização completa!');
        }
      } catch (err) {
        if (isMounted) {
          console.error('❌ [useHomeData] Erro na inicialização:', err);
          setError(err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initialize();

    return () => {
      console.log('🧹 [useHomeData] Cleanup');
      isMounted = false;
      // NÃO reseta hasLoaded aqui!
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]); // ← NÃO adicionar outras dependências!

  // ==========================================
  // RETORNO
  // ==========================================

  console.log('📤 [useHomeData] Retornando, rooms atual:', rooms);

  return {
    rooms,
    availableRooms,
    featuredRooms,
    services,
    stats,
    loading,
    initialized,
    error,
    loadRooms,
    loadServices,
    loadAll,
    loadRoomDetails,
    refresh,
    refreshRooms,
    refreshServices,
    calculateReservationPrice,
    calculateServicesTotal,
    checkAvailability
  };
};

export const useHomePageData = (options = {}) => {
  const homeData = useHomeData(options);
  const heroRooms = homeData.featuredRooms;
  const heroServices = homeData.services?.categories?.featured || [];
  return { ...homeData, heroRooms, heroServices };
};