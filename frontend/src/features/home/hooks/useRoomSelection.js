import { useState, useCallback, useMemo, useEffect } from 'react';

/**
 * Hook personalizado para gerenciar seleção de quartos
 * 
 * @param {Array} rooms - Lista de quartos
 * @returns {Object} Estado e funções de seleção
 */
const useRoomSelection = (rooms = []) => {
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  // ==========================================================================
  // LOGS PARA DEBUG
  // ==========================================================================

  useEffect(() => {
    console.log('🔵 [useRoomSelection] Inicializado');
    console.log('   📦 rooms recebidos:', rooms.length);
  }, []);

  useEffect(() => {
    console.log('🟡 [useRoomSelection] selectedRoomId mudou:', selectedRoomId);
  }, [selectedRoomId]);

  useEffect(() => {
    console.log('🟢 [useRoomSelection] rooms atualizados:', rooms.length);
  }, [rooms]);

  // ==========================================================================
  // OBTER OBJETO COMPLETO DO QUARTO SELECIONADO
  // ==========================================================================

  const selectedRoom = useMemo(() => {
    console.log('🔴 [useRoomSelection] Calculando selectedRoom');
    console.log('   🆔 ID:', selectedRoomId);
    console.log('   🏨 rooms disponíveis:', rooms.length);

    if (!selectedRoomId) {
      console.log('   ➡️ Retornando: null (sem ID)');
      return null;
    }

    if (!rooms || rooms.length === 0) {
      console.log('   ⚠️ rooms vazio, retornando null');
      return null;
    }

    const room = rooms.find(room => room.id === selectedRoomId);
    
    if (room) {
      console.log('   ✅ Quarto encontrado:', room.number);
    } else {
      console.log('   ❌ Quarto NÃO encontrado com ID:', selectedRoomId);
    }

    return room || null;
  }, [selectedRoomId, rooms]);

  // ==========================================================================
  // FUNÇÕES DE SELEÇÃO
  // ==========================================================================

  const selectRoom = useCallback((roomOrId) => {
    console.log('🟠 [useRoomSelection] selectRoom chamado');
    console.log('   📥 Recebido:', roomOrId);

    if (!roomOrId) {
      console.log('   ⚠️ Valor inválido');
      return;
    }

    if (typeof roomOrId === 'object') {
      console.log('   🆔 ID extraído:', roomOrId.id);
      setSelectedRoomId(roomOrId.id);
    } else {
      console.log('   🆔 Usando ID direto:', roomOrId);
      setSelectedRoomId(roomOrId);
    }
  }, []);

  const deselectRoom = useCallback(() => {
    console.log('⚪ [useRoomSelection] deselectRoom chamado');
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
    selectedRoomId,
    selectedRoom,
    selectRoom,
    deselectRoom,
    isRoomSelected,
    toggleRoomSelection,
  };
};

export default useRoomSelection;