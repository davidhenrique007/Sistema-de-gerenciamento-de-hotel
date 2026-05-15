import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';
import { useI18n } from '../../../../contexts/I18nContext';
import Button from '../../../../shared/components/ui/Button';
import RoomStatusBadge from './RoomStatusBadge';
import { ROOM_STATUS } from '../../constants/room.types';
import styles from './RoomCard.module.css';

/**
 * RoomCard Component - Card de exibição de quarto com dois botões
 */
const RoomCard = ({ room, onSelect, onDetails, isSelected = false }) => {
  const { t } = useI18n();

  // ==========================================================================
  // STATES
  // ==========================================================================
  const [currentImage, setCurrentImage] = useState(room.images?.main || room.images?.[0]);
  const [imageError, setImageError] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleSelect = () => {
    if (room.status === ROOM_STATUS.AVAILABLE && onSelect) {
      onSelect(room);
    }
  };

  const handleDetails = () => {
    if (onDetails) {
      onDetails(room);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageClick = (imgSrc) => {
    setCurrentImage(imgSrc);
    setImageError(false);
  };

  // ==========================================================================
  // FORMATADORES
  // ==========================================================================

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: room.price?.currency || 'MZN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(room.price?.amount || room.price_per_night || 0);

  const isAvailable = room.status === ROOM_STATUS.AVAILABLE;

  // Obter galeria de imagens
  const galleryImages = room.images?.gallery || room.images?.slice(1) || [];
  const mainImage = room.images?.main || room.images?.[0];

  // ==========================================================================
  // TRADUÇÕES - USAR t() PARA TODOS OS TEXTOS
  // ==========================================================================
  
  // Traduzir tipo do quarto (se for chave ou texto normal)
  const getTranslatedType = () => {
    if (room.typeLabelKey) {
      return t(room.typeLabelKey);
    }
    if (room.typeLabel) {
      return t(room.typeLabel) || room.typeLabel;
    }
    return room.type || '';
  };

  // Traduzir descrição
  const getTranslatedDescription = () => {
    if (room.descriptionKey) {
      return t(room.descriptionKey);
    }
    if (room.description) {
      // Se a descrição parece uma chave (contém ponto), tentar traduzir
      if (room.description.includes('.')) {
        return t(room.description);
      }
      return room.description;
    }
    return '';
  };

  // Traduzir tipo de cama
  const getTranslatedBedType = () => {
    if (room.bedTypeKey) {
      return t(room.bedTypeKey);
    }
    if (room.bedType) {
      if (room.bedType.includes('.')) {
        return t(room.bedType);
      }
      return room.bedType;
    }
    return '';
  };

  // Traduzir amenities
  const getTranslatedAmenities = () => {
    if (room.amenitiesKeys && room.amenitiesKeys.length > 0) {
      return room.amenitiesKeys.map(key => t(key));
    }
    if (room.amenities && room.amenities.length > 0) {
      return room.amenities.map(amenity => {
        if (amenity.includes('.')) {
          return t(amenity);
        }
        return amenity;
      });
    }
    return [];
  };

  const translatedType = getTranslatedType();
  const translatedDescription = getTranslatedDescription();
  const translatedBedType = getTranslatedBedType();
  const translatedAmenities = getTranslatedAmenities();

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <article
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      aria-labelledby={`room-title-${room.id}`}
      onMouseEnter={() => setShowGallery(true)}
      onMouseLeave={() => setShowGallery(false)}
    >
      <div className={styles.imageContainer}>
        <img
          src={imageError ? '/assets/images/default-room.jpg' : currentImage}
          onError={handleImageError}
          alt={`${t('rooms.room')} ${room.number || room.room_number}`}
          className={styles.mainImage}
          loading="lazy"
        />

        {showGallery && (
          <div className={styles.thumbnailStrip}>
            <img
              src={mainImage}
              alt={t('rooms.main')}
              className={`${styles.thumbnail} ${currentImage === mainImage ? styles.activeThumbnail : ''}`}
              onClick={() => handleImageClick(mainImage)}
            />
            {galleryImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${t('rooms.photo')} ${index + 1}`}
                className={`${styles.thumbnail} ${currentImage === img ? styles.activeThumbnail : ''}`}
                onClick={() => handleImageClick(img)}
              />
            ))}
          </div>
        )}

        <div className={styles.statusContainer}>
          <RoomStatusBadge status={room.status} size="sm" />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.roomInfo}>
            <h3 id={`room-title-${room.id}`} className={styles.title}>
              {t('rooms.room')} {room.number || room.room_number}
            </h3>
            <p className={styles.roomType}>{translatedType}</p>
          </div>
          <div className={styles.price}>
            <span className={styles.priceAmount}>{formattedPrice}</span>
            <span className={styles.pricePeriod}>{t('rooms.per_night')}</span>
          </div>
        </div>

        <p className={styles.description}>{translatedDescription}</p>

        <div className={styles.detailItem}>
          <span className={styles.detailIcon}>👥</span>
          <span>
            {room.capacity || 2} {t('rooms.guests')}
          </span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailIcon}>📏</span>
          <span>{room.size || 25} m²</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailIcon}>🛏️</span>
          <span>{translatedBedType}</span>
        </div>

        <div className={styles.amenities}>
          {translatedAmenities.slice(0, 4).map((amenity, index) => (
            <span key={index} className={styles.amenity}>
              {amenity}
            </span>
          ))}
          {translatedAmenities.length > 4 && (
            <span className={styles.amenityMore}>+{translatedAmenities.length - 4}</span>
          )}
        </div>

        <div className={styles.buttonGroup}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDetails}
            className={styles.detailsButton}
          >
            {t('rooms.details')}
          </Button>

          <Button
            variant={isAvailable ? 'primary' : 'secondary'}
            size="sm"
            onClick={handleSelect}
            disabled={!isAvailable}
            className={styles.selectButton}
          >
            {isAvailable ? t('rooms.select') : t('rooms.unavailable')}
          </Button>
        </div>
      </div>
    </article>
  );
};

RoomCard.propTypes = {
  room: PropTypes.object.isRequired,
  onSelect: PropTypes.func,
  onDetails: PropTypes.func,
  isSelected: PropTypes.bool,
};

RoomCard.defaultProps = {
  onSelect: undefined,
  onDetails: undefined,
  isSelected: false,
};

export default memo(RoomCard);
