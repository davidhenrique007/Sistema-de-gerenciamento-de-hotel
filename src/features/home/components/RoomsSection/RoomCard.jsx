// ============================================
// COMPONENT: RoomCard
// ============================================
// Responsabilidade: Card individual de quarto com integração de ocupação
// VERSÃO CORRIGIDA - Props filtradas e imagem fallback
// ============================================

import React, { useState, useCallback, memo } from 'react';
import { Button, ButtonVariant, ButtonSize } from '../../../../shared/components/ui';
import { RoomStatusBadge, RoomStatus } from './RoomStatusBadge.jsx';
import styles from './RoomCard.module.css';

// Ícones (simulados)
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

// Imagem placeholder para fallback
const PLACEHOLDER_IMAGE = '/assets/images/placeholder-room.jpg';

export const RoomCard = memo(({
  // Dados do quarto
  id,
  number,
  type,
  typeLabel,
  capacity,
  pricePerNight,
  pricePerNightFormatted,
  status: initialStatus,
  statusLabel: initialStatusLabel,
  mainImage,
  amenities = [],
  
  // Callbacks e hooks
  onSelect,
  occupancyHook,
  
  // Estado de loading
  isLoading = false,
  
  // Modo de seleção
  selected = false,
  
  // Classes adicionais
  className = '',
  ...props
}) => {
  // ========================================
  // ESTADO LOCAL E HOOKS
  // ========================================
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Obter status atualizado do hook de ocupação
  const currentStatus = occupancyHook?.getRoomStatus?.(id) || initialStatus;
  const isOccupied = currentStatus === RoomStatus.OCCUPIED;
  const isAvailable = currentStatus === RoomStatus.AVAILABLE;
  const isLoadingStatus = occupancyHook?.loadingMap?.get(id) || false;
  const error = occupancyHook?.errorMap?.get(id);

  // ========================================
  // HANDLERS
  // ========================================
  
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback((e) => {
    setImageError(true);
    e.target.src = PLACEHOLDER_IMAGE; // Fallback para imagem placeholder
    console.warn(`Usando imagem placeholder para o quarto ${number}`);
  }, [number]);

  const handleSelect = useCallback(() => {
    if (isOccupied) {
      console.warn(`Quarto ${number} está ocupado e não pode ser selecionado`);
      return;
    }

    if (selected || isLoading || isLoadingStatus) {
      return;
    }

    if (onSelect) {
      onSelect({
        id,
        number,
        type,
        typeLabel,
        capacity,
        pricePerNight,
        status: currentStatus
      });
    }
  }, [onSelect, id, number, type, typeLabel, capacity, pricePerNight, currentStatus, isOccupied, selected, isLoading, isLoadingStatus]);

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
    !isAvailable && styles.unavailable,
    selected && styles.selected,
    isHovered && styles.hovered,
    (isLoading || isLoadingStatus) && styles.loading,
    className
  ].filter(Boolean).join(' ');

  const statusLabel = isOccupied ? 'Quarto ocupado' : 'Quarto disponível';

  // Separar props que não devem ir para o DOM
  const { available, isAvailable: _, occupancyError, ...validProps } = props;

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
      aria-disabled={!isAvailable}
      {...validProps} // Usar apenas props válidas
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
        
        {/* Badge de status com estado atualizado */}
        <div className={styles.statusBadge}>
          <RoomStatusBadge
            status={currentStatus}
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

        {/* Amenities */}
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
            variant={isAvailable ? ButtonVariant.PRIMARY : ButtonVariant.SECONDARY}
            size={ButtonSize.MEDIUM}
            fullWidth
            onClick={handleSelect}
            disabled={!isAvailable || isLoading || isLoadingStatus}
            loading={isLoading || isLoadingStatus}
            aria-label={isAvailable 
              ? `Selecionar quarto ${number}` 
              : `Quarto ${number} indisponível - ${statusLabel}`
            }
          >
            {isAvailable ? 'Selecionar Quarto' : 'Indisponível'}
          </Button>
        </div>
      </div>

      {/* Overlay de loading */}
      {(isLoading || isLoadingStatus) && (
        <div className={styles.loadingOverlay} aria-hidden="true">
          <div className={styles.loadingSpinner}></div>
        </div>
      )}
    </article>
  );
});

RoomCard.displayName = 'RoomCard';