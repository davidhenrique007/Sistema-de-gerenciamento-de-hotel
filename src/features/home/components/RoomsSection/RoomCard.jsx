// ============================================
// COMPONENT: RoomCard
// ============================================
// Responsabilidade: Card individual de quarto com galeria de imagens
// VERSÃO COM LOGS DE DEBUG
// ============================================

import React, { useState, useCallback, memo } from 'react';
import { Button, ButtonVariant, ButtonSize } from '../../../../shared/components/ui';
import { RoomStatusBadge, RoomStatus } from './RoomStatusBadge.jsx';
import styles from './RoomCard.module.css';

// Mapa de ícones para amenities (usando emojis - substituir por SVGs em produção)
const amenityIcons = {
  'Wi-Fi': '📶',
  'TV': '📺',
  'Ar condicionado': '❄️',
  'Frigobar': '🧊',
  'Banheira': '🛁',
  'Cafeteira': '☕',
  'Secador': '💨',
  'Cofre': '🔒',
  'Varanda': '🏞️',
  'Vista mar': '🌊',
  'Mesa de trabalho': '💼',
  '2 camas': '🛏️🛏️',
  'Berço': '👶',
  'Sala': '🛋️',
  'Jacuzzi': '🫧',
  'Vista 360': '🏔️'
};

// Imagem placeholder para fallback
const PLACEHOLDER_IMAGE = '/assets/images/placeholder-room.jpg';

export const RoomCard = memo(({
  id,
  number,
  type,
  typeLabel,
  capacity,
  pricePerNight,
  pricePerNightFormatted,
  status: initialStatus,
  mainImage,
  amenities = [],
  onSelect,
  occupancyHook,
  isLoading = false,
  selected = false,
  className = '',
  ...props
}) => {
  // LOG CRÍTICO - mostra se onSelect existe
  console.log('🎴 Renderizando RoomCard', { 
    number, 
    pricePerNightFormatted,
    hasOnSelect: !!onSelect  // ← ISTO É FUNDAMENTAL!
  });
  
  const [currentImage, setCurrentImage] = useState(mainImage || `/assets/images/rooms/${type}/main.jpg`);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);

  const roomImages = [
    mainImage || `/assets/images/rooms/${type}/main.jpg`,
    `/assets/images/rooms/${type}/1.jpg`,
    `/assets/images/rooms/${type}/2.jpg`,
    `/assets/images/rooms/${type}/3.jpg`
  ];

  const currentStatus = occupancyHook?.getRoomStatus?.(id) || initialStatus;
  const isOccupied = currentStatus === RoomStatus.OCCUPIED;
  const isAvailable = currentStatus === RoomStatus.AVAILABLE;
  const isLoadingStatus = occupancyHook?.loadingMap?.get(id) || false;

  const handleImageError = useCallback((e) => {
    setImageError(true);
    e.target.src = PLACEHOLDER_IMAGE;
  }, []);

  const handleImageClick = useCallback((imgSrc) => {
    setCurrentImage(imgSrc);
    setImageError(false);
  }, []);

  const handleSelect = useCallback(() => {
    console.log('🖱️ [RoomCard] Botão SELECIONAR clicado!', number);
    console.log('🖱️ [RoomCard] onSelect existe?', !!onSelect);
    
    if (isOccupied || selected || isLoading || isLoadingStatus) {
      console.log('🖱️ [RoomCard] Bloqueado por condição');
      return;
    }
    
    if (onSelect) {
      console.log('🖱️ [RoomCard] Chamando onSelect com:', { id, number });
      onSelect({
        id,
        number,
        type,
        typeLabel,
        capacity,
        pricePerNight,
        status: currentStatus
      });
    } else {
      console.error('🖱️ [RoomCard] ERRO: onSelect é undefined!');
    }
  }, [onSelect, id, number, type, typeLabel, capacity, pricePerNight, currentStatus, isOccupied, selected, isLoading, isLoadingStatus]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    setShowThumbnails(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setShowThumbnails(false);
  }, []);

  const cardClasses = [
    styles.card,
    !isAvailable && styles.unavailable,
    selected && styles.selected,
    isHovered && !selected && !isLoading && !isLoadingStatus && styles.hovered,
    (isLoading || isLoadingStatus) && styles.loading,
    className
  ].filter(Boolean).join(' ');

  const { available, isAvailable: _, occupancyError, ...validProps } = props;

  return (
    <article
      className={cardClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-labelledby={`room-title-${id}`}
      aria-describedby={`room-desc-${id}`}
      aria-disabled={!isAvailable}
      tabIndex={isAvailable ? 0 : -1}
      {...validProps}
    >
      <div className={styles.imageContainer}>
        <img
          src={currentImage}
          alt={`Quarto ${typeLabel} - ${number}`}
          className={styles.mainImage}
          onError={handleImageError}
          loading="lazy"
        />
        
        <div className={styles.statusBadge}>
          <RoomStatusBadge status={currentStatus} size="small" />
        </div>

        {showThumbnails && isAvailable && (
          <div className={styles.thumbnailStrip}>
            {roomImages.map((img, index) => (
              <button
                key={index}
                className={`${styles.thumbnail} ${currentImage === img ? styles.activeThumbnail : ''}`}
                onClick={() => handleImageClick(img)}
                aria-label={`Ver imagem ${index + 1} do quarto`}
              >
                <img src={img} alt={`Miniatura ${index + 1}`} onError={handleImageError} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.roomInfo}>
            <span className={styles.roomType}>{typeLabel}</span>
            <h3 id={`room-title-${id}`} className={styles.title}>
              Quarto {number}
            </h3>
          </div>
          <div className={styles.priceContainer}>
            <span className={styles.priceValue}>{pricePerNightFormatted}</span>
            <span className={styles.pricePeriod}>/noite</span>
          </div>
        </div>

        <div className={styles.capacityInfo}>
          <span className={styles.capacityIcon}>👥</span>
          <span className={styles.capacityText}>
            {capacity} {capacity === 1 ? 'hóspede' : 'hóspedes'}
          </span>
        </div>

        <div className={styles.amenities} id={`room-desc-${id}`}>
          {amenities.map((amenity, index) => (
            <div key={index} className={styles.amenity}>
              <span className={styles.amenityIcon} aria-hidden="true">
                {amenityIcons[amenity] || '•'}
              </span>
              <span className={styles.amenityName}>{amenity}</span>
            </div>
          ))}
        </div>

        <div className={styles.action}>
          <Button
            variant={isAvailable ? ButtonVariant.PRIMARY : ButtonVariant.SECONDARY}
            size={ButtonSize.MEDIUM}
            fullWidth
            onClick={handleSelect}
            disabled={!isAvailable || isLoading || isLoadingStatus}
            loading={isLoading || isLoadingStatus}
          >
            {isAvailable ? 'Selecionar Quarto' : 'Indisponível'}
          </Button>
        </div>
      </div>

      {(isLoading || isLoadingStatus) && (
        <div className={styles.loadingOverlay} aria-hidden="true">
          <div className={styles.loadingSpinner}></div>
        </div>
      )}
    </article>
  );
});

RoomCard.displayName = 'RoomCard';