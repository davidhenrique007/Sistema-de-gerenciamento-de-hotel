import { useState, useEffect, useMemo, useCallback } from 'react';
import { roomsData } from '../data/roomsData';
import { ROOM_STATUS } from '../constants/room.types';

/**
 * Hook personalizado para gerenciar dados dos quartos
 * 
 * Responsabilidades:
 * - Fornecer lista de quartos
 * - Simular carregamento assíncrono
 * - Expor funções de filtragem
 * - Preparado para futura integração com API
 * 
 * @returns {Object} Estado e funções dos quartos
 */
const useRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==========================================================================
  // SIMULA CARREGAMENTO DE API
  // ==========================================================================

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        
        // Simula chamada de API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Em produção, aqui seria: const response = await api.get('/rooms')
        setRooms(roomsData);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar quartos. Tente novamente.');
        console.error('[useRooms] Error fetching rooms:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // ==========================================================================
  // FUNÇÕES DE FILTRAGEM (MEMOIZADAS)
  // ==========================================================================

  const getAvailableRooms = useCallback(() => {
    return rooms.filter(room => room.status === ROOM_STATUS.AVAILABLE);
  }, [rooms]);

  const getRoomById = useCallback((id) => {
    return rooms.find(room => room.id === id);
  }, [rooms]);

  const getRoomsByType = useCallback((type) => {
    return rooms.filter(room => room.type === type);
  }, [rooms]);

  const getRoomsByCapacity = useCallback((minCapacity) => {
    return rooms.filter(room => room.capacity >= minCapacity);
  }, [rooms]);

  const getRoomsByPriceRange = useCallback((minPrice, maxPrice) => {
    return rooms.filter(room => 
      room.price.amount >= minPrice && room.price.amount <= maxPrice
    );
  }, [rooms]);

  // ==========================================================================
  // ESTATÍSTICAS (MEMOIZADAS)
  // ==========================================================================

  const stats = useMemo(() => {
    const available = rooms.filter(r => r.status === ROOM_STATUS.AVAILABLE).length;
    const occupied = rooms.filter(r => r.status === ROOM_STATUS.OCCUPIED).length;
    const maintenance = rooms.filter(r => r.status === ROOM_STATUS.MAINTENANCE).length;
    
    const minPrice = rooms.length > 0 
      ? Math.min(...rooms.map(r => r.price.amount))
      : 0;
    
    const maxPrice = rooms.length > 0
      ? Math.max(...rooms.map(r => r.price.amount))
      : 0;

    return {
      total: rooms.length,
      available,
      occupied,
      maintenance,
      minPrice,
      maxPrice,
    };
  }, [rooms]);

  // ==========================================================================
  // FORMATAÇÃO DE PREÇO
  // ==========================================================================

  const formatPrice = useCallback((amount, currency = 'MZN') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('MZN', 'MZN').trim();
  }, []);

  // ==========================================================================
  // RETORNO
  // ==========================================================================

  return {
    // Dados
    rooms,
    isLoading,
    error,
    
    // Estatísticas
    stats,
    
    // Funções de filtragem
    getAvailableRooms,
    getRoomById,
    getRoomsByType,
    getRoomsByCapacity,
    getRoomsByPriceRange,
    
    // Utilitários
    formatPrice,
    
    // Refresh (para futura implementação)
    // refreshRooms: () => { ... }
  };
};

export default useRooms;