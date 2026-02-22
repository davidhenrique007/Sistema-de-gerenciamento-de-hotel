// ============================================
// COMPONENT: RoomCard
// ============================================
// Responsabilidade: Card individual de quarto
// Integração: Hooks para atualização em tempo real
// ============================================

import React, { useState, useCallback, memo } from 'react';
import { Button, ButtonVariant, ButtonSize } from '../../../../shared/components/ui';
import { RoomStatusBadge, RoomStatus } from "./RoomStatusBadge.jsx";
import styles from './RoomCard.module.css';

// ============================================
// ÍCONES (simulados - em produção usar biblioteca de ícones)
// ============================================

const icons = {
  wifi: '📶',
  tv: '📺',
  ac: '❄️',
  fridge: '🧊',
  bath: '🛁',
  coffee: '☕',
  bed: '🛏️',
  people: '👥',
  calendar: '📅'
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const RoomCard = memo(({
  // Dados do quarto
  id,
  number,
  type,
  typeLabel,
  capacity,
  pricePerNight,
  pricePerNightFormatted,
  status,
  statusLabel,
  mainImage,
  amenities = [],
  available = true,
  
  // Callbacks
  onSelect,
  onStatusChange,
  
  // Estado de loading
  isLoading = false,
  
  // Modo de seleção
  selected = false,
  
  // Classes adicionais
  className = '',
  ...props
}) => {
  // ========================================
  // ESTADOS
  // ========================================
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // ========================================
  // HANDLERS
  // ========================================
  
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    console.error(`Erro ao carregar imagem do quarto ${number}`);
  }, [number]);

  const handleSelect = useCallback(() => {
    if (onSelect && available && !isLoading) {
      onSelect({ id, number, type, pricePerNight });
    }
  }, [onSelect, available, isLoading, id, number, type, pricePerNight]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // ========================================
  // CLASSES CSS
  // ========================================
  
  const cardClasses = [
    styles.card,
    !available && styles.unavailable,
    selected && styles.selected,
    isHovered && styles.hovered,
    isLoading && styles.loading,
    className
  ].filter(Boolean).join(' ');

  // ========================================
  // RENDER
  // ========================================
  
  return (
    <article
      className={cardClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-labelledby={`room-title-${id}`}
      aria-describedby={`room-desc-${id}`}
      {...props}
    >
      {/* Imagem do quarto */}
      <div className={styles.imageContainer}>
        {!imageLoaded && !imageError && (
          <div className={styles.imagePlaceholder}>
            <span className={styles.loadingIndicator}>Carregando...</span>
          </div>
        )}
        
        <img
          src={mainImage || `/assets/images/rooms/${type}/main.jpg`}
          alt={`Quarto ${typeLabel} - Número ${number}`}
          className={styles.image}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
        
        {/* Badge de status */}
        <div className={styles.statusBadge}>
          <RoomStatusBadge
            status={status}
            size="small"
          />
        </div>

        {/* Badge de capacidade */}
        <div className={styles.capacityBadge}>
          <span className={styles.capacityIcon} aria-hidden="true">
            {icons.people}
          </span>
          <span className={styles.capacityText}>
            {capacity} {capacity === 1 ? 'hóspede' : 'hóspedes'}
          </span>
        </div>
      </div>

      {/* Conteúdo do card */}
      <div className={styles.content}>
        {/* Cabeçalho */}
        <div className={styles.header}>
          <h3 id={`room-title-${id}`} className={styles.title}>
            {typeLabel} - {number}
          </h3>
          <div className={styles.price}>
            <span className={styles.priceValue}>{pricePerNightFormatted}</span>
            <span className={styles.pricePeriod}>/noite</span>
          </div>
        </div>

        {/* Amenities (limitado a 4) */}
        <div className={styles.amenities} id={`room-desc-${id}`}>
          {amenities.slice(0, 4).map((amenity, index) => (
            <div key={index} className={styles.amenity}>
              <span className={styles.amenityIcon} aria-hidden="true">
                {icons[amenity.toLowerCase()] || '•'}
              </span>
              <span className={styles.amenityName}>{amenity}</span>
            </div>
          ))}
          {amenities.length > 4 && (
            <div className={styles.amenityMore}>
              +{amenities.length - 4}
            </div>
          )}
        </div>

        {/* Botão de ação */}
        <div className={styles.action}>
          <Button
            variant={available ? ButtonVariant.PRIMARY : ButtonVariant.SECONDARY}
            size={ButtonSize.MEDIUM}
            fullWidth
            onClick={handleSelect}
            disabled={!available || isLoading}
            loading={isLoading}
            aria-label={available 
              ? `Selecionar quarto ${number}` 
              : `Quarto ${number} indisponível`
            }
          >
            {available ? 'Selecionar Quarto' : 'Indisponível'}
          </Button>
        </div>
      </div>

      {/* Overlay de loading */}
      {isLoading && (
        <div className={styles.loadingOverlay} aria-hidden="true">
          <div className={styles.loadingSpinner}></div>
        </div>
      )}
    </article>
  );
});

RoomCard.displayName = 'RoomCard';

// ============================================
// COMPONENTE: RoomCardSkeleton
// ============================================
// Versão skeleton para estado de carregamento
// ============================================

export const RoomCardSkeleton = () => {
  return (
    <div className={`${styles.card} ${styles.skeleton}`} aria-hidden="true">
      <div className={styles.imageContainer}>
        <div className={styles.imagePlaceholder}></div>
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.skeletonTitle}></div>
          <div className={styles.skeletonPrice}></div>
        </div>
        <div className={styles.amenities}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.skeletonAmenity}></div>
          ))}
        </div>
        <div className={styles.action}>
          <div className={styles.skeletonButton}></div>
        </div>
      </div>
    </div>
  );
};

RoomCardSkeleton.displayName = 'RoomCardSkeleton';