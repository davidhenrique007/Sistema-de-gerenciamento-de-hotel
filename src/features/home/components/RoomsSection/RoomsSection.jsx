// ============================================
// COMPONENT: RoomsSection
// ============================================
// Responsabilidade: Seção principal de quartos da Home
// Integração: Hooks de estado e use cases
// ============================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, ContainerSize } from '../../../../shared/components/layout';
import { RoomGrid } from './RoomGrid.jsx';
import { RoomStatus } from "./RoomStatusBadge.jsx";
import styles from './RoomsSection.module.css';

// ============================================
// CONSTANTES
// ============================================

const DEFAULT_TITLE = 'Nossos Quartos';
const DEFAULT_SUBTITLE = 'Conforto e sofisticação para todos os momentos';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const RoomsSection = ({
  // Dados
  rooms = [],
  totalRooms,
  
  // Estados
  isLoading = false,
  error = null,
  
  // Callbacks
  onSelectRoom,
  onRetry,
  
  // Configuração
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
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
  const [selectedRoomStatus, setSelectedRoomStatus] = useState(null);

  // ========================================
  // HANDLERS
  // ========================================
  
  const handleSelectRoom = useCallback((room) => {
    // Atualizar estado local
    setSelectedRoomId(room.id);
    setSelectedRoomStatus(room.status);
    
    // Chamar callback externo
    if (onSelectRoom) {
      onSelectRoom(room);
    }
    
    // Log para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('Quarto selecionado:', room);
    }
  }, [onSelectRoom]);

  const handleRetry = useCallback(() => {
    if (onRetry) {
      onRetry();
    }
  }, [onRetry]);

  // ========================================
  // MEMOIZAR DADOS
  // ========================================
  
  const availableRoomsCount = useMemo(() => {
    return rooms.filter(room => room.status === RoomStatus.AVAILABLE).length;
  }, [rooms]);

  const roomsWithStatus = useMemo(() => {
    return rooms.map(room => ({
      ...room,
      isAvailable: room.status === RoomStatus.AVAILABLE,
      statusLabel: room.statusLabel || (room.status === RoomStatus.AVAILABLE ? 'Disponível' : 'Ocupado')
    }));
  }, [rooms]);

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
          />
        )}

        {/* Grid de quartos */}
        <div className={styles.gridContainer}>
          <RoomGrid
            rooms={roomsWithStatus}
            onSelect={handleSelectRoom}
            selectedRoomId={selectedRoomId}
            isLoading={isLoading}
            layout={layout}
          />
        </div>

        {/* Estado de erro */}
        {error && (
          <div className={styles.errorState} role="alert">
            <p className={styles.errorMessage}>{error}</p>
            {onRetry && (
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

        {/* Feedback de seleção */}
        {selectedRoomId && selectedRoomStatus === RoomStatus.AVAILABLE && (
          <div className={styles.selectionFeedback} aria-live="polite">
            <p className={styles.selectionMessage}>
              Quarto selecionado. Prossiga com a reserva.
            </p>
          </div>
        )}
      </Container>
    </section>
  );
};

RoomsSection.displayName = 'RoomsSection';

// ============================================
// COMPONENTE: RoomsSectionSkeleton
// ============================================
// Versão skeleton para carregamento
// ============================================

export const RoomsSectionSkeleton = () => {
  return (
    <section className={`${styles.section} ${styles.skeleton}`} aria-hidden="true">
      <Container size={ContainerSize.LARGE}>
        <div className={styles.gridHeader}>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonSubtitle} />
        </div>
        <div className={styles.gridContainer}>
          <div className={styles.grid}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className={styles.gridItem}>
                <div className={styles.skeletonCard}>
                  <div className={styles.skeletonImage} />
                  <div className={styles.skeletonContent}>
                    <div className={styles.skeletonTitle} />
                    <div className={styles.skeletonPrice} />
                    <div className={styles.skeletonAmenities}>
                      {[1, 2, 3, 4].map(j => (
                        <div key={j} className={styles.skeletonAmenity} />
                      ))}
                    </div>
                    <div className={styles.skeletonButton} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

RoomsSectionSkeleton.displayName = 'RoomsSectionSkeleton';