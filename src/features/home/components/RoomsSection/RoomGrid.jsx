// ============================================
// COMPONENT: RoomGrid
// ============================================
// Responsabilidade: Grid responsivo de cards de quartos
// Performance: Lazy loading de imagens, memoização de cards
// VERSÃO CORRIGIDA - Com roomItems definido
// ============================================

import React, { memo, useMemo } from 'react';
import { RoomCard } from './RoomCard.jsx';
import styles from './RoomsSection.module.css';

// ============================================
// CONSTANTES
// ============================================

const GRID_LAYOUTS = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
  large: 4
};

// ============================================
// COMPONENTE: RoomGridItem (Memoizado)
// ============================================

const RoomGridItem = memo(({ room, onSelect, selectedRoomId, isLoading, occupancyHook }) => {
  console.log(`🔲 [RoomGridItem] Renderizando quarto ${room.number}`, {
    id: room.id,
    selected: selectedRoomId === room.id
  });
  
  const isSelected = selectedRoomId === room.id;

  return (
    <div className={styles.gridItem}>
      <RoomCard
        // Props individuais do quarto
        id={room.id}
        number={room.number}
        type={room.type}
        typeLabel={room.typeLabel}
        capacity={room.capacity}
        pricePerNight={room.pricePerNight}
        pricePerNightFormatted={room.pricePerNightFormatted}  // ← ESSENCIAL!
        status={room.status}
        mainImage={room.mainImage}
        amenities={room.amenities}
        
        // Props de controle
        onSelect={onSelect}
        selected={isSelected}
        isLoading={isLoading}
        occupancyHook={occupancyHook}
      />
    </div>
  );
});

RoomGridItem.displayName = 'RoomGridItem';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const RoomGrid = memo(({
  rooms = [],
  onSelect,
  selectedRoomId = null,
  isLoading = false,
  loadingCards = 6,
  layout = 'auto',
  occupancyHook,
  className = '',
  ...props
}) => {
  // ========================================
  // LOGS PARA DIAGNÓSTICO
  // ========================================
  console.log('🔷 [RoomGrid] Renderizando');
  console.log('   rooms recebidos:', rooms);
  console.log('   rooms length:', rooms?.length);
  console.log('   isLoading:', isLoading);
  console.log('   selectedRoomId:', selectedRoomId);

  // ========================================
  // MEMOIZAR LISTA DE QUARTOS
  // ========================================
  
  const roomItems = useMemo(() => {
    console.log('🔄 [RoomGrid] Criando roomItems com', rooms.length, 'quartos');
    
    if (!rooms || rooms.length === 0) {
      console.log('   ⚠️ Nenhum quarto para criar items');
      return [];
    }

    return rooms.map(room => (
      <RoomGridItem
        key={room.id}
        room={room}
        onSelect={onSelect}
        selectedRoomId={selectedRoomId}
        isLoading={isLoading}
        occupancyHook={occupancyHook}
      />
    ));
  }, [rooms, onSelect, selectedRoomId, isLoading, occupancyHook]);

  // ========================================
  // SKELETON LOADING
  // ========================================
  
  const skeletonItems = useMemo(() => {
    console.log('🔄 [RoomGrid] Criando skeleton items');
    return Array(loadingCards).fill(null).map((_, index) => (
      <div key={`skeleton-${index}`} className={styles.gridItem}>
        <div className={styles.skeletonCard}>
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonPrice} />
            <div className={styles.skeletonAmenities}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={styles.skeletonAmenity} />
              ))}
            </div>
            <div className={styles.skeletonButton} />
          </div>
        </div>
      </div>
    ));
  }, [loadingCards]);

  // ========================================
  // CLASSES CSS
  // ========================================
  
  const gridClasses = [
    styles.grid,
    styles[`layout-${layout}`],
    rooms.length === 0 && styles.empty,
    className
  ].filter(Boolean).join(' ');

  console.log('🎨 [RoomGrid] Renderizando JSX');
  console.log('   roomItems length:', roomItems.length);
  console.log('   skeletonItems length:', skeletonItems.length);
  console.log('   isEmpty:', rooms.length === 0);

  // ========================================
  // RENDER
  // ========================================
  
  return (
    <div 
      className={gridClasses}
      role="grid"
      aria-label="Lista de quartos disponíveis"
      {...props}
    >
      {isLoading ? skeletonItems : roomItems}
      
      {!isLoading && rooms.length === 0 && (
        <div className={styles.emptyState}>
          <p className={styles.emptyStateText}>
            Nenhum quarto disponível no momento.
          </p>
        </div>
      )}
    </div>
  );
});

RoomGrid.displayName = 'RoomGrid';

// ============================================
// COMPONENTE: RoomGridHeader
// ============================================

export const RoomGridHeader = ({
  title = 'Nossos Quartos',
  subtitle = 'Escolha o quarto perfeito para sua estadia',
  totalRooms,
  availableRooms,
  onFilterChange,
  className = '',
  ...props
}) => {
  console.log('📋 [RoomGridHeader] Renderizando', { totalRooms, availableRooms });

  return (
    <div className={`${styles.gridHeader} ${className}`} {...props}>
      <div className={styles.headerContent}>
        <h2 className={styles.gridTitle}>{title}</h2>
        {subtitle && <p className={styles.gridSubtitle}>{subtitle}</p>}
      </div>
      
      {totalRooms !== undefined && (
        <div className={styles.gridStats}>
          <span className={styles.totalRooms}>
            {totalRooms} {totalRooms === 1 ? 'quarto' : 'quartos'}
            {availableRooms !== undefined && ` (${availableRooms} disponíveis)`}
          </span>
        </div>
      )}
    </div>
  );
};

RoomGridHeader.displayName = 'RoomGridHeader';