// ============================================
// HOOK: useRoomOccupancy
// ============================================
// Responsabilidade: Controle e atualização de ocupação de quartos
// Integra com UpdateRoomOccupancyUseCase
// ============================================

import { useState, useCallback, useRef } from 'react';

// ============================================
// CONSTANTES
// ============================================

const OccupancyStatus = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
  RESERVED: 'reserved',
  CLEANING: 'cleaning',
  CHECKING: 'checking' // Estado temporário durante verificação
};

// ============================================
// HOOK PRINCIPAL
// ============================================

export const useRoomOccupancy = ({
  // Dependências injetadas
  updateRoomOccupancyUseCase,
  
  // Configurações
  autoCheckAvailability = true,
  preventDoubleSubmission = true,
  
  // Callbacks
  onOccupancyChanged,
  onError
} = {}) => {
  // ========================================
  // ESTADOS
  // ========================================
  
  const [occupancyMap, setOccupancyMap] = useState(new Map());
  const [loadingMap, setLoadingMap] = useState(new Map());
  const [errorMap, setErrorMap] = useState(new Map());
  
  // Controle de submissão dupla
  const pendingRequests = useRef(new Set());
  const abortControllers = useRef(new Map());

  // ========================================
  // FUNÇÕES AUXILIARES
  // ========================================
  
  const updateRoomStatus = useCallback((roomId, status, metadata = {}) => {
    setOccupancyMap(prev => {
      const newMap = new Map(prev);
      newMap.set(roomId, { status, ...metadata, updatedAt: new Date().toISOString() });
      return newMap;
    });
  }, []);

  const setRoomLoading = useCallback((roomId, isLoading) => {
    setLoadingMap(prev => {
      const newMap = new Map(prev);
      if (isLoading) {
        newMap.set(roomId, true);
      } else {
        newMap.delete(roomId);
      }
      return newMap;
    });
  }, []);

  const setRoomError = useCallback((roomId, error) => {
    setErrorMap(prev => {
      const newMap = new Map(prev);
      if (error) {
        newMap.set(roomId, error);
      } else {
        newMap.delete(roomId);
      }
      return newMap;
    });
  }, []);

  // ========================================
  // VERIFICAÇÃO DE DISPONIBILIDADE
  // ========================================
  
  const checkAvailability = useCallback(async (roomId, options = {}) => {
    if (!roomId) return null;
    
    // Prevenir verificação duplicada
    if (preventDoubleSubmission && pendingRequests.current.has(`check-${roomId}`)) {
      console.log(`Verificação já em andamento para o quarto ${roomId}`);
      return null;
    }
    
    // Criar AbortController para cancelamento
    const controller = new AbortController();
    abortControllers.current.set(`check-${roomId}`, controller);
    
    pendingRequests.current.add(`check-${roomId}`);
    setRoomLoading(roomId, true);
    setRoomError(roomId, null);
    
    // Atualizar status temporário
    updateRoomStatus(roomId, OccupancyStatus.CHECKING);
    
    try {
      // Simular verificação - em produção, usaria um use case real
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Resultado mock - em produção, viria do use case
      const isAvailable = Math.random() > 0.3; // 70% de chance de estar disponível
      
      const newStatus = isAvailable ? OccupancyStatus.AVAILABLE : OccupancyStatus.OCCUPIED;
      
      updateRoomStatus(roomId, newStatus, {
        checkedAt: new Date().toISOString(),
        ...options
      });
      
      pendingRequests.current.delete(`check-${roomId}`);
      abortControllers.current.delete(`check-${roomId}`);
      
      return { isAvailable, status: newStatus };
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`Verificação cancelada para o quarto ${roomId}`);
        return null;
      }
      
      setRoomError(roomId, {
        code: error.code || 'CHECK_FAILED',
        message: error.message || 'Erro ao verificar disponibilidade'
      });
      
      updateRoomStatus(roomId, OccupancyStatus.AVAILABLE); // Fallback para disponível
      
      if (onError) {
        onError(roomId, error);
      }
      
      return null;
    } finally {
      setRoomLoading(roomId, false);
      pendingRequests.current.delete(`check-${roomId}`);
    }
  }, [preventDoubleSubmission, updateRoomStatus, setRoomLoading, setRoomError, onError]);

  // ========================================
  // ATUALIZAÇÃO DE OCUPAÇÃO
  // ========================================
  
  const occupyRoom = useCallback(async (roomId, reservationData = {}) => {
    if (!roomId) return false;
    
    // Verificar se já está ocupado
    const currentStatus = occupancyMap.get(roomId)?.status;
    if (currentStatus === OccupancyStatus.OCCUPIED) {
      const error = { code: 'ROOM_ALREADY_OCCUPIED', message: 'Quarto já está ocupado' };
      setRoomError(roomId, error);
      if (onError) onError(roomId, error);
      return false;
    }
    
    // Prevenir submissão duplicada
    if (preventDoubleSubmission && pendingRequests.current.has(`occupy-${roomId}`)) {
      console.log(`Requisição já em andamento para o quarto ${roomId}`);
      return false;
    }
    
    // Criar AbortController para cancelamento
    const controller = new AbortController();
    abortControllers.current.set(`occupy-${roomId}`, controller);
    
    pendingRequests.current.add(`occupy-${roomId}`);
    setRoomLoading(roomId, true);
    setRoomError(roomId, null);
    
    try {
      // Usar use case se disponível
      let result;
      
      if (updateRoomOccupancyUseCase) {
        result = await updateRoomOccupancyUseCase.occupy(
          roomId,
          reservationData.guestsCount || 1,
          reservationData.reservationId || `res-${Date.now()}`
        );
      } else {
        // Mock para desenvolvimento
        await new Promise(resolve => setTimeout(resolve, 800));
        result = { success: true };
      }
      
      if (result?.success) {
        updateRoomStatus(roomId, OccupancyStatus.OCCUPIED, {
          occupiedAt: new Date().toISOString(),
          reservationId: reservationData.reservationId,
          ...reservationData
        });
        
        if (onOccupancyChanged) {
          onOccupancyChanged(roomId, OccupancyStatus.OCCUPIED, reservationData);
        }
        
        pendingRequests.current.delete(`occupy-${roomId}`);
        abortControllers.current.delete(`occupy-${roomId}`);
        
        return true;
      } else {
        throw new Error('Falha ao ocupar quarto');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`Ocupação cancelada para o quarto ${roomId}`);
        return false;
      }
      
      setRoomError(roomId, {
        code: error.code || 'OCCUPY_FAILED',
        message: error.message || 'Erro ao ocupar quarto'
      });
      
      if (onError) {
        onError(roomId, error);
      }
      
      return false;
    } finally {
      setRoomLoading(roomId, false);
      pendingRequests.current.delete(`occupy-${roomId}`);
    }
  }, [updateRoomOccupancyUseCase, occupancyMap, preventDoubleSubmission, updateRoomStatus, setRoomLoading, setRoomError, onOccupancyChanged, onError]);

  const releaseRoom = useCallback(async (roomId, options = {}) => {
    if (!roomId) return false;
    
    // Verificar se está ocupado
    const currentStatus = occupancyMap.get(roomId)?.status;
    if (currentStatus !== OccupancyStatus.OCCUPIED && currentStatus !== OccupancyStatus.RESERVED) {
      const error = { code: 'ROOM_NOT_OCCUPIED', message: 'Quarto não está ocupado' };
      setRoomError(roomId, error);
      if (onError) onError(roomId, error);
      return false;
    }
    
    // Prevenir submissão duplicada
    if (preventDoubleSubmission && pendingRequests.current.has(`release-${roomId}`)) {
      console.log(`Requisição já em andamento para o quarto ${roomId}`);
      return false;
    }
    
    const controller = new AbortController();
    abortControllers.current.set(`release-${roomId}`, controller);
    
    pendingRequests.current.add(`release-${roomId}`);
    setRoomLoading(roomId, true);
    
    try {
      if (updateRoomOccupancyUseCase) {
        await updateRoomOccupancyUseCase.release(roomId);
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      updateRoomStatus(roomId, OccupancyStatus.AVAILABLE, {
        releasedAt: new Date().toISOString(),
        ...options
      });
      
      if (onOccupancyChanged) {
        onOccupancyChanged(roomId, OccupancyStatus.AVAILABLE, options);
      }
      
      return true;
    } catch (error) {
      if (error.name === 'AbortError') return false;
      
      setRoomError(roomId, {
        code: error.code || 'RELEASE_FAILED',
        message: error.message || 'Erro ao liberar quarto'
      });
      
      return false;
    } finally {
      setRoomLoading(roomId, false);
      pendingRequests.current.delete(`release-${roomId}`);
    }
  }, [updateRoomOccupancyUseCase, occupancyMap, preventDoubleSubmission, updateRoomStatus, setRoomLoading, setRoomError, onOccupancyChanged, onError]);

  // ========================================
  // CANCELAMENTO
  // ========================================
  
  const cancelOperation = useCallback((roomId, operation) => {
    const key = operation ? `${operation}-${roomId}` : null;
    
    if (key && abortControllers.current.has(key)) {
      abortControllers.current.get(key).abort();
      abortControllers.current.delete(key);
      pendingRequests.current.delete(key);
      setRoomLoading(roomId, false);
    } else if (!operation) {
      // Cancelar todas as operações para este quarto
      ['check', 'occupy', 'release'].forEach(op => {
        const k = `${op}-${roomId}`;
        if (abortControllers.current.has(k)) {
          abortControllers.current.get(k).abort();
          abortControllers.current.delete(k);
          pendingRequests.current.delete(k);
        }
      });
      setRoomLoading(roomId, false);
    }
  }, [setRoomLoading]);

  // ========================================
  // RETORNO
  // ========================================
  
  return {
    // Estado
    occupancyMap,
    loadingMap,
    errorMap,
    
    // Funções principais
    checkAvailability,
    occupyRoom,
    releaseRoom,
    cancelOperation,
    
    // Getters específicos
    getRoomStatus: useCallback((roomId) => occupancyMap.get(roomId)?.status || OccupancyStatus.AVAILABLE, [occupancyMap]),
    getRoomLoading: useCallback((roomId) => loadingMap.get(roomId) || false, [loadingMap]),
    getRoomError: useCallback((roomId) => errorMap.get(roomId) || null, [errorMap]),
    
    // Utilitários
    isRoomAvailable: useCallback((roomId) => {
      const status = occupancyMap.get(roomId)?.status;
      return status === OccupancyStatus.AVAILABLE || !status;
    }, [occupancyMap]),
    
    isRoomOccupied: useCallback((roomId) => {
      return occupancyMap.get(roomId)?.status === OccupancyStatus.OCCUPIED;
    }, [occupancyMap]),
    
    // Reset
    clearRoomState: useCallback((roomId) => {
      cancelOperation(roomId);
      setOccupancyMap(prev => {
        const newMap = new Map(prev);
        newMap.delete(roomId);
        return newMap;
      });
      setErrorMap(prev => {
        const newMap = new Map(prev);
        newMap.delete(roomId);
        return newMap;
      });
    }, [cancelOperation]),
    
    clearAll: useCallback(() => {
      abortControllers.current.forEach(controller => controller.abort());
      abortControllers.current.clear();
      pendingRequests.current.clear();
      setOccupancyMap(new Map());
      setLoadingMap(new Map());
      setErrorMap(new Map());
    }, [])
  };
};