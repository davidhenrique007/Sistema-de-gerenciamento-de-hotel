// ============================================
// HOOK: useRooms
// ============================================
// Responsabilidade: Gerenciar lógica de carregamento e estado dos quartos
// Separação: Desacoplado da UI, apenas lógica de dados
// ============================================

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// ============================================
// CONSTANTES
// ============================================

const DEFAULT_FILTERS = {
  type: null,
  minCapacity: null,
  maxPrice: null,
  amenities: []
};

const DEFAULT_SORT = {
  field: 'pricePerNight',
  order: 'asc'
};

// ============================================
// HOOK PRINCIPAL
// ============================================

export const useRooms = ({
  // Dependências injetadas
  listAvailableRoomsUseCase,
  getRoomDetailsUseCase,
  
  // Configurações
  autoLoad = true,
  initialFilters = DEFAULT_FILTERS,
  initialSort = DEFAULT_SORT,
  
  // Cache
  enableCache = true,
  cacheTime = 5 * 60 * 1000 // 5 minutos
} = {}) => {
  // ========================================
  // ESTADOS
  // ========================================
  
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState(initialSort);
  
  // Cache e controle de requisições
  const cache = useRef(new Map());
  const abortControllerRef = useRef(null);
  const mountedRef = useRef(true);

  // ========================================
  // DADOS DERIVADOS - COMPLETAMENTE CORRIGIDOS
  // ========================================
  
  // ✅ CORRIGIDO: Filtrar por status 'AVAILABLE'
  const availableRooms = useMemo(() => {
    return rooms.filter(room => room.status === 'AVAILABLE');
  }, [rooms]);

  // ✅ CORRIGIDO: Processamento completo com filtros e ordenação
  const filteredAndSortedRooms = useMemo(() => {
    let result = [...rooms];

    // Aplicar filtros
    if (filters.type) {
      result = result.filter(room => room.type === filters.type);
    }

    if (filters.minCapacity) {
      result = result.filter(room => room.capacity >= filters.minCapacity);
    }

    // ✅ CORRIGIDO: Usar amount do pricePerNight para filtro de preço
    if (filters.maxPrice) {
      result = result.filter(room => (room.pricePerNight?.amount || 0) <= filters.maxPrice);
    }

    if (filters.amenities?.length > 0) {
      result = result.filter(room =>
        filters.amenities.every(amenity =>
          room.amenities?.some(a => a.toLowerCase().includes(amenity.toLowerCase()))
        )
      );
    }

    // ✅ CORRIGIDO: Ordenação usando amount do pricePerNight
    result.sort((a, b) => {
      // Extrair valores para ordenação baseado no campo selecionado
      let aVal, bVal;
      
      if (sort.field === 'pricePerNight') {
        aVal = a.pricePerNight?.amount || 0;
        bVal = b.pricePerNight?.amount || 0;
      } else if (sort.field === 'capacity') {
        aVal = a.capacity || 0;
        bVal = b.capacity || 0;
      } else {
        aVal = a[sort.field];
        bVal = b[sort.field];
      }
      
      if (sort.order === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return result;
  }, [rooms, filters, sort]);

  // ✅ CORRIGIDO: Estatísticas precisas
  const stats = useMemo(() => {
    return {
      total: rooms.length,
      available: rooms.filter(room => room.status === 'AVAILABLE').length,
      occupied: rooms.filter(room => room.status !== 'AVAILABLE').length,
      // ✅ CORRIGIDO: Média de preços usando amount
      averagePrice: rooms.length > 0
        ? rooms.reduce((sum, room) => sum + (room.pricePerNight?.amount || 0), 0) / rooms.length
        : 0,
      // ✅ NOVO: Preço mínimo e máximo
      minPrice: rooms.length > 0
        ? Math.min(...rooms.map(room => room.pricePerNight?.amount || 0))
        : 0,
      maxPrice: rooms.length > 0
        ? Math.max(...rooms.map(room => room.pricePerNight?.amount || 0))
        : 0
    };
  }, [rooms]);

  // ========================================
  // FUNÇÕES DE CARREGAMENTO - CORRIGIDAS
  // ========================================
  
  const loadRooms = useCallback(async (useCache = true) => {
    // Cancelar requisição anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo AbortController
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      // Verificar cache
      const cacheKey = 'all-rooms';
      const cached = cache.current.get(cacheKey);
      
      if (useCache && enableCache && cached && Date.now() - cached.timestamp < cacheTime) {
        setRooms(cached.data);
        setLoading(false);
        return;
      }

      // Verificar se o use case foi injetado
      if (!listAvailableRoomsUseCase) {
        throw new Error('listAvailableRoomsUseCase não foi injetado');
      }

      // Executar use case
      const result = await listAvailableRoomsUseCase.execute({
        filters,
        sort,
        signal: abortControllerRef.current.signal
      });

      // ✅ CORREÇÃO: Garantir que os dados têm a estrutura esperada
      const normalizedResult = result.map(room => ({
        ...room,
        // Garantir que pricePerNight existe
        pricePerNight: room.pricePerNight || { amount: 0, currency: 'MZN' },
        // Garantir que status existe
        status: room.status || 'AVAILABLE'
      }));

      // Verificar se o componente ainda está montado
      if (!mountedRef.current) return;

      // Atualizar cache
      if (enableCache) {
        cache.current.set(cacheKey, {
          data: normalizedResult,
          timestamp: Date.now()
        });
      }

      setRooms(normalizedResult);
    } catch (err) {
      // Ignorar erros de cancelamento
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
        return;
      }

      if (!mountedRef.current) return;

      setError({
        message: err.message || 'Erro ao carregar quartos',
        code: err.code,
        context: err.context
      });

      // Log em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao carregar quartos:', err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [listAvailableRoomsUseCase, filters, sort, enableCache, cacheTime]);

  const loadRoomDetails = useCallback(async (roomId) => {
    if (!roomId) return;

    // Cancelar requisição anterior de detalhes
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setLoadingDetails(true);
    setError(null);

    try {
      // Verificar cache
      const cacheKey = `room-${roomId}`;
      const cached = cache.current.get(cacheKey);
      
      if (enableCache && cached && Date.now() - cached.timestamp < cacheTime) {
        setSelectedRoom(cached.data);
        setLoadingDetails(false);
        return;
      }

      // Verificar se o use case foi injetado
      if (!getRoomDetailsUseCase) {
        throw new Error('getRoomDetailsUseCase não foi injetado');
      }

      // Executar use case
      const result = await getRoomDetailsUseCase.execute({
        roomId,
        signal: abortControllerRef.current.signal
      });

      // ✅ CORREÇÃO: Normalizar dados do quarto
      const normalizedRoom = {
        ...result,
        pricePerNight: result.pricePerNight || { amount: 0, currency: 'MZN' },
        status: result.status || 'AVAILABLE'
      };

      // Verificar se o componente ainda está montado
      if (!mountedRef.current) return;

      // Atualizar cache
      if (enableCache) {
        cache.current.set(cacheKey, {
          data: normalizedRoom,
          timestamp: Date.now()
        });
      }

      setSelectedRoom(normalizedRoom);
    } catch (err) {
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
        return;
      }

      if (!mountedRef.current) return;

      setError({
        message: err.message || `Erro ao carregar detalhes do quarto ${roomId}`,
        code: err.code,
        context: err.context
      });
    } finally {
      if (mountedRef.current) {
        setLoadingDetails(false);
      }
    }
  }, [getRoomDetailsUseCase, enableCache, cacheTime]);

  // ========================================
  // FUNÇÕES DE FILTRO E ORDENAÇÃO
  // ========================================
  
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const updateSort = useCallback((field, order) => {
    setSort({ field, order });
  }, []);

  // ========================================
  // FUNÇÕES DE REFRESH
  // ========================================
  
  const refresh = useCallback(() => {
    // Limpar cache
    cache.current.clear();
    // Recarregar
    loadRooms(false);
  }, [loadRooms]);

  const refreshRoomDetails = useCallback((roomId) => {
    // Limpar cache do quarto específico
    cache.current.delete(`room-${roomId}`);
    // Recarregar detalhes
    loadRoomDetails(roomId);
  }, [loadRoomDetails]);

  // ========================================
  // FUNÇÕES DE LIMPEZA
  // ========================================
  
  const clearSelection = useCallback(() => {
    setSelectedRoom(null);
  }, []);

  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  // ✅ NOVO: Função para obter preço formatado
  const getFormattedPrice = useCallback((room) => {
    if (!room || !room.pricePerNight) return '0 MTn';
    const amount = room.pricePerNight.amount || 0;
    const currency = room.pricePerNight.currency || 'MTn';
    return `${amount} ${currency}`;
  }, []);

  // ✅ NOVO: Função para verificar disponibilidade
  const isRoomAvailable = useCallback((roomId) => {
    const room = rooms.find(r => r.id === roomId);
    return room?.status === 'AVAILABLE';
  }, [rooms]);

  // ========================================
  // EFEITOS
  // ========================================
  
  // Carregamento inicial
  useEffect(() => {
    mountedRef.current = true;

    if (autoLoad) {
      loadRooms();
    }

    // Cleanup
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vazio = executa apenas UMA vez na montagem!

  // ========================================
  // RETORNO
  // ========================================
  
  return {
    // Dados
    rooms: filteredAndSortedRooms,
    allRooms: rooms,
    selectedRoom,
    availableRooms,
    stats,
    
    // Estados
    loading,
    loadingDetails,
    error,
    
    // Filtros e ordenação
    filters,
    sort,
    updateFilters,
    resetFilters,
    updateSort,
    
    // Ações
    loadRooms,
    loadRoomDetails,
    refresh,
    refreshRoomDetails,
    clearSelection,
    clearCache,
    
    // Cache
    cacheEnabled: enableCache,
    clearCache,
    
    // ✅ NOVAS UTILIDADES
    getFormattedPrice,
    isRoomAvailable
  };
};

// ============================================
// HOOK: useRoom (para um único quarto)
// ============================================

export const useRoom = (roomId, options = {}) => {
  const {
    rooms,
    selectedRoom,
    loadingDetails,
    error,
    loadRoomDetails,
    refreshRoomDetails,
    clearSelection,
    getFormattedPrice,
    isRoomAvailable
  } = useRooms(options);

  const room = useMemo(() => {
    if (selectedRoom?.id === roomId) return selectedRoom;
    return rooms.find(r => r.id === roomId);
  }, [rooms, selectedRoom, roomId]);

  useEffect(() => {
    if (roomId && !room) {
      loadRoomDetails(roomId);
    }
  }, [roomId, room, loadRoomDetails]);

  return {
    room,
    loading: loadingDetails,
    error,
    refresh: () => refreshRoomDetails(roomId),
    clear: clearSelection,
    // ✅ UTILIDADES PARA O QUARTO ESPECÍFICO
    formattedPrice: room ? getFormattedPrice(room) : '0 MTn',
    isAvailable: room ? isRoomAvailable(roomId) : false
  };
};