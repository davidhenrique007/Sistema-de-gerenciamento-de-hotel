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
  // DADOS DERIVADOS
  // ========================================
  
  const availableRooms = useMemo(() => {
    return rooms.filter(room => room.available);
  }, [rooms]);

  const filteredAndSortedRooms = useMemo(() => {
    let result = [...rooms];

    // Aplicar filtros
    if (filters.type) {
      result = result.filter(room => room.type === filters.type);
    }

    if (filters.minCapacity) {
      result = result.filter(room => room.capacity >= filters.minCapacity);
    }

    if (filters.maxPrice) {
      result = result.filter(room => room.pricePerNight <= filters.maxPrice);
    }

    if (filters.amenities?.length > 0) {
      result = result.filter(room =>
        filters.amenities.every(amenity =>
          room.amenities?.some(a => a.toLowerCase().includes(amenity.toLowerCase()))
        )
      );
    }

    // Aplicar ordenação
    result.sort((a, b) => {
      const aVal = a[sort.field];
      const bVal = b[sort.field];
      
      if (sort.order === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return result;
  }, [rooms, filters, sort]);

  const stats = useMemo(() => {
    return {
      total: rooms.length,
      available: availableRooms.length,
      occupied: rooms.length - availableRooms.length,
      averagePrice: rooms.length > 0
        ? rooms.reduce((sum, room) => sum + room.pricePerNight, 0) / rooms.length
        : 0
    };
  }, [rooms, availableRooms]);

  // ========================================
  // FUNÇÕES DE CARREGAMENTO
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

      // Verificar se o componente ainda está montado
      if (!mountedRef.current) return;

      // Atualizar cache
      if (enableCache) {
        cache.current.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }

      setRooms(result);
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

      // Verificar se o componente ainda está montado
      if (!mountedRef.current) return;

      // Atualizar cache
      if (enableCache) {
        cache.current.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }

      setSelectedRoom(result);
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

  // ========================================
  // EFEITOS - CORRIGIDOS!
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

  // ⚠️ EFEITO PERIGOSO REMOVIDO!
  // O efeito que recarregava quando filtros mudavam foi removido
  // Agora o usuário deve chamar loadRooms() manualmente após aplicar filtros

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
    clearCache
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
    clearSelection
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
    clear: clearSelection
  };
};