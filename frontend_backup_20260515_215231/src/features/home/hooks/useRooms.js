import { useState, useEffect, useMemo, useCallback } from 'react';
import { useI18n } from '../../../contexts/I18nContext';
import { roomsData } from '../data/roomsData';
import { ROOM_STATUS } from '../constants/room.types';

const useRooms = () => {
  const { t } = useI18n();
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para traduzir um quarto
  const translateRoom = useCallback((room) => {
    return {
      ...room,
      typeLabel: t(room.typeLabelKey),
      description: t(room.descriptionKey),
      bedType: t(room.bedTypeKey),
      amenities: room.amenitiesKeys ? room.amenitiesKeys.map(key => t(key)) : room.amenities,
    };
  }, [t]);

  // Função para traduzir todos os quartos
  const translateRooms = useCallback((roomsList) => {
    return roomsList.map(room => translateRoom(room));
  }, [translateRoom]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        // Traduzir os quartos ao carregar
        const translatedRooms = translateRooms(roomsData);
        setRooms(translatedRooms);
        setError(null);
      } catch (err) {
        setError(t('errors.server_error'));
        console.error('[useRooms] Error fetching rooms:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [translateRooms, t]);

  // Re-traduzir quando o idioma mudar
  useEffect(() => {
    if (rooms.length > 0) {
      const updatedRooms = translateRooms(roomsData);
      setRooms(updatedRooms);
    }
  }, [t, translateRooms]);

  const getAvailableRooms = useCallback(() => {
    return rooms.filter(room => room.status === ROOM_STATUS.AVAILABLE);
  }, [rooms]);

  const getRoomById = useCallback((id) => {
    const room = roomsData.find(room => room.id === id);
    return room ? translateRoom(room) : undefined;
  }, [translateRoom]);

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

  const formatPrice = useCallback((amount, currency = 'MZN') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('MZN', 'MZN').trim();
  }, []);

  return {
    rooms,
    isLoading,
    error,
    stats,
    getAvailableRooms,
    getRoomById,
    getRoomsByType,
    getRoomsByCapacity,
    getRoomsByPriceRange,
    formatPrice,
  };
};

export default useRooms;
