// ============================================
// COMPONENT: RoomCard
// ============================================
// Responsabilidade: Card individual de quarto com galeria de imagens
// VERSÃO CORRIGIDA - Com pricePerNightFormatted
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
  // Dados do quarto
  id,
  number,
  type,
  typeLabel,
  capacity,
  pricePerNight,
  pricePerNightFormatted,  // ← ADICIONADO!
  status: initialStatus,
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
  console.log('🎴 Renderizando RoomCard', { number, pricePerNightFormatted });
  
  // ========================================
  // ESTADO LOCAL
  // ========================================
  
  const [currentImage, setCurrentImage] = useState(mainImage || `/assets/images/rooms/${type}/main.jpg`);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);

  // Lista de imagens do quarto (main + 3 adicionais)
  const roomImages = [
    mainImage || `/assets/images/rooms/${type}/main.jpg`,
    `/assets/images/rooms/${type}/1.jpg`,
    `/assets/images/rooms/${type}/2.jpg`,
    `/assets/images/rooms/${type}/3.jpg`
  ];

  // Obter status atualizado do hook de ocupação
  const currentStatus = occupancyHook?.getRoomStatus?.(id) || initialStatus;
  const isOccupied = currentStatus === RoomStatus.OCCUPIED;
  const isAvailable = currentStatus === RoomStatus.AVAILABLE;
  const isLoadingStatus = occupancyHook?.loadingMap?.get(id) || false;

  // ========================================
  // HANDLERS
  // ========================================
  
  const handleImageError = useCallback((e) => {
    setImageError(true);
    e.target.src = PLACEHOLDER_IMAGE;
  }, []);

  const handleImageClick = useCallback((imgSrc) => {
    setCurrentImage(imgSrc);
    setImageError(false);
  }, []);

  const handleSelect = useCallback(() => {
    if (isOccupied || selected || isLoading || isLoadingStatus) return;
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
    setShowThumbnails(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setShowThumbnails(false);
  }, []);

  // ========================================
  // CLASSES CSS
  // ========================================
  
  const cardClasses = [
    styles.card,
    !isAvailable && styles.unavailable,
    selected && styles.selected,
    isHovered && !selected && !isLoading && !isLoadingStatus && styles.hovered,
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
      tabIndex={isAvailable ? 0 : -1}
      {...validProps}
    >
      {/* Container de imagem com galeria */}
      <div className={styles.imageContainer}>
        {/* Imagem principal */}
        <img
          src={currentImage}
          alt={`Quarto ${typeLabel} - ${number}`}
          className={styles.mainImage}
          onError={handleImageError}
          loading="lazy"
        />
        
        {/* Badge de status */}
        <div className={styles.statusBadge}>
          <RoomStatusBadge status={currentStatus} size="small" />
        </div>

        {/* Miniaturas (aparecem no hover) */}
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

      {/* Conteúdo do card */}
      <div className={styles.content}>
        {/* Cabeçalho com tipo e preço */}
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

        {/* Capacidade */}
        <div className={styles.capacityInfo}>
          <span className={styles.capacityIcon}>👥</span>
          <span className={styles.capacityText}>
            {capacity} {capacity === 1 ? 'hóspede' : 'hóspedes'}
          </span>
        </div>

        {/* Amenities em formato chips */}
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

        {/* Botão de ação */}
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