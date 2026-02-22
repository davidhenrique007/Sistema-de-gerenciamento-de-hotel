// ============================================
// COMPONENT: RoomGrid
// ============================================
// Responsabilidade: Grid responsivo de cards de quartos
// Performance: Lazy loading de imagens, memoização de cards
// ============================================

import React, { memo, useMemo } from 'react';
import { RoomCard } from './RoomCard.js';
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

const RoomGridItem = memo(({ room, onSelect, selectedRoomId, isLoading }) => {
  const isSelected = selectedRoomId === room.id;

  return (
    <div className={styles.gridItem}>
      <RoomCard
        {...room}
        onSelect={onSelect}
        selected={isSelected}
        isLoading={isLoading}
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
  layout = 'auto', // 'auto', 'compact', 'expanded'
  className = '',
  ...props
}) => {
  // ========================================
  // MEMOIZAR LISTA DE QUARTOS
  // ========================================
  
  const roomItems = useMemo(() => {
    return rooms.map(room => (
      <RoomGridItem
        key={room.id}
        room={room}
        onSelect={onSelect}
        selectedRoomId={selectedRoomId}
        isLoading={isLoading}
      />
    ));
  }, [rooms, onSelect, selectedRoomId, isLoading]);

  // ========================================
  // SKELETON LOADING
  // ========================================
  
  const skeletonItems = useMemo(() => {
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
  onFilterChange,
  className = '',
  ...props
}) => {
  return (
    <div className={`${styles.gridHeader} ${className}`} {...props}>
      <div className={styles.headerContent}>
        <h2 className={styles.gridTitle}>{title}</h2>
        {subtitle && <p className={styles.gridSubtitle}>{subtitle}</p>}
      </div>
      
      {totalRooms !== undefined && (
        <div className={styles.gridStats}>
          <span className={styles.totalRooms}>
            {totalRooms} {totalRooms === 1 ? 'quarto disponível' : 'quartos disponíveis'}
          </span>
        </div>
      )}
    </div>
  );
};

RoomGridHeader.displayName = 'RoomGridHeader';