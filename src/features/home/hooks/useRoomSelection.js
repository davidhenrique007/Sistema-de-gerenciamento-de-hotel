import { useState, useCallback, useMemo } from 'react';

/**
 * Hook personalizado para gerenciar seleção de quartos
 * 
 * Responsabilidades:
 * - Controlar estado do quarto selecionado
 * - Fornecer funções de seleção/deseleção
 * - Preparado para integração com estado global futuro
 * 
 * @param {Array} rooms - Lista de quartos (opcional, para obter objeto completo)
 * @returns {Object} Estado e funções de seleção
 */
const useRoomSelection = (rooms = []) => {
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  // ==========================================================================
  // OBTER OBJETO COMPLETO DO QUARTO SELECIONADO
  // ==========================================================================

  const selectedRoom = useMemo(() => {
    if (!selectedRoomId || !rooms.length) return null;
    return rooms.find(room => room.id === selectedRoomId) || null;
  }, [selectedRoomId, rooms]);

  // ==========================================================================
  // FUNÇÕES DE SELEÇÃO
  // ==========================================================================

  const selectRoom = useCallback((roomOrId) => {
    if (typeof roomOrId === 'object' && roomOrId !== null) {
      // Se recebeu objeto room
      setSelectedRoomId(roomOrId.id);
    } else {
      // Se recebeu apenas ID
      setSelectedRoomId(roomOrId);
    }
  }, []);

  const deselectRoom = useCallback(() => {
    setSelectedRoomId(null);
  }, []);

  const isRoomSelected = useCallback((roomId) => {
    return selectedRoomId === roomId;
  }, [selectedRoomId]);

  const toggleRoomSelection = useCallback((roomOrId) => {
    const roomId = typeof roomOrId === 'object' ? roomOrId.id : roomOrId;
    
    if (selectedRoomId === roomId) {
      deselectRoom();
    } else {
      setSelectedRoomId(roomId);
    }
  }, [selectedRoomId, deselectRoom]);

  // ==========================================================================
  // RETORNO
  // ==========================================================================

  return {
    // Estado
    selectedRoomId,
    selectedRoom,
    
    // Funções
    selectRoom,
    deselectRoom,
    isRoomSelected,
    toggleRoomSelection,
  };
};

export default useRoomSelection;