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
  // LOGS PARA DIAGNÓSTICO
  // ========================================
  console.log('🏨 [RoomsSection] Renderizando');
  console.log('   rooms recebidos:', rooms);
  console.log('   rooms length:', rooms?.length);
  console.log('   isLoading:', isLoading);
  console.log('   occupancyHook presente:', !!occupancyHook);

  // ========================================
  // ESTADOS LOCAIS
  // ========================================
  
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  // ========================================
  // DADOS DERIVADOS COM ESTADO DE OCUPAÇÃO
  // ========================================
  
  const roomsWithOccupancy = useMemo(() => {
    console.log('🔄 [RoomsSection] Recalculando roomsWithOccupancy');
    
    if (!rooms || rooms.length === 0) {
      console.log('   ⚠️ Nenhum quarto para processar');
      return [];
    }

    const processed = rooms.map(room => {
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

    console.log(`   ✅ ${processed.length} quartos processados`);
    return processed;
  }, [rooms, occupancyHook]);

  const availableRoomsCount = useMemo(() => {
    const count = roomsWithOccupancy.filter(room => room.isAvailable).length;
    console.log(`📊 [RoomsSection] Quartos disponíveis: ${count}`);
    return count;
  }, [roomsWithOccupancy]);

  // ========================================
  // HANDLERS
  // ========================================
  
  const handleSelectRoom = useCallback((room) => {
    console.log(`🖱️ [RoomsSection] Selecionando quarto:`, room);
    
    const isAvailable = occupancyHook?.isRoomAvailable?.(room.id) ?? room.isAvailable;
    
    if (!isAvailable) {
      console.warn(`⛔ Quarto ${room.number} não está disponível para seleção`);
      return;
    }

    setSelectedRoomId(room.id);
    
    if (onSelectRoom) {
      onSelectRoom(room);
    }
  }, [occupancyHook, onSelectRoom]);

  const handleRetry = useCallback(() => {
    console.log('🔄 [RoomsSection] Tentando novamente');
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

  console.log('🎨 [RoomsSection] Renderizando JSX');
  console.log('   roomsWithOccupancy length:', roomsWithOccupancy.length);

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