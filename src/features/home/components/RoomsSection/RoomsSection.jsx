// ============================================
// COMPONENT: RoomsSection
// ============================================
// Responsabilidade: Seção principal de quartos com integração de use cases
// ============================================

import React, { useState, useCallback, useMemo } from 'react';
import { Container, ContainerSize } from '../../../../shared/components/layout';
import { RoomGrid, RoomGridHeader } from './RoomGrid.jsx';
import { RoomStatus } from './RoomStatusBadge.jsx';
import styles from './RoomsSection.module.css';

export const RoomsSection = ({
  // Dados
  rooms = [],
  totalRooms,
  
  // Estados
  isLoading = false,
  error = null,
  
  // Callbacks e hooks
  onSelectRoom,
  occupancyHook,
  
  // Configuração
  title = 'Nossos Quartos',
  subtitle = 'Conforto e sofisticação para todos os momentos',
  showHeader = true,
  layout = 'auto',
  
  // Classes
  className = '',
  ...props
}) => {
  // ========================================
  // ESTADOS LOCAIS
  // ========================================
  
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  // ========================================
  // DADOS DERIVADOS COM ESTADO DE OCUPAÇÃO
  // ========================================
  
  const roomsWithOccupancy = useMemo(() => {
    return rooms.map(room => {
      // Obter status atualizado do hook de ocupação
      const currentStatus = occupancyHook?.getRoomStatus?.(room.id) || room.status;
      const isOccupied = currentStatus === RoomStatus.OCCUPIED;
      const isLoading = occupancyHook?.loadingMap?.get(room.id) || false;

      return {
        ...room,
        status: currentStatus,
        isAvailable: !isOccupied,
        isLoading,
        occupancyError: occupancyHook?.errorMap?.get(room.id)
      };
    });
  }, [rooms, occupancyHook]);

  const availableRoomsCount = useMemo(() => {
    return roomsWithOccupancy.filter(room => room.isAvailable).length;
  }, [roomsWithOccupancy]);

  // ========================================
  // HANDLERS
  // ========================================
  
  const handleSelectRoom = useCallback((room) => {
    // Verificar se o quarto está disponível via hook
    const isAvailable = occupancyHook?.isRoomAvailable?.(room.id) ?? room.isAvailable;
    
    if (!isAvailable) {
      console.warn(`Quarto ${room.number} não está disponível para seleção`);
      return;
    }

    setSelectedRoomId(room.id);
    
    if (onSelectRoom) {
      onSelectRoom(room);
    }
  }, [occupancyHook, onSelectRoom]);

  const handleRetry = useCallback(() => {
    if (props.onRetry) {
      props.onRetry();
    }
  }, [props.onRetry]);

  // ========================================
  // RENDER
  // ========================================
  
  const sectionClasses = [
    styles.section,
    isLoading && styles.loading,
    error && styles.error,
    className
  ].filter(Boolean).join(' ');

  return (
    <section 
      className={sectionClasses}
      aria-labelledby="rooms-section-title"
      {...props}
    >
      <Container size={ContainerSize.LARGE}>
        {/* Cabeçalho da seção */}
        {showHeader && (
          <RoomGridHeader
            title={title}
            subtitle={subtitle}
            totalRooms={totalRooms || rooms.length}
            availableRooms={availableRoomsCount}
          />
        )}

        {/* Grid de quartos */}
        <div className={styles.gridContainer}>
          <RoomGrid
            rooms={roomsWithOccupancy}
            onSelect={handleSelectRoom}
            selectedRoomId={selectedRoomId}
            isLoading={isLoading}
            layout={layout}
            occupancyHook={occupancyHook}
          />
        </div>

        {/* Estado de erro */}
        {error && (
          <div className={styles.errorState} role="alert">
            <p className={styles.errorMessage}>{error}</p>
            {props.onRetry && (
              <button 
                className={styles.retryButton}
                onClick={handleRetry}
                aria-label="Tentar novamente"
              >
                Tentar Novamente
              </button>
            )}
          </div>
        )}
      </Container>
    </section>
  );
};