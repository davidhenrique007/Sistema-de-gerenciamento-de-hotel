import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';
import { useI18n } from '../../../../contexts/I18nContext';
import Button from '../../../../shared/components/ui/Button';
import RoomStatusBadge from './RoomStatusBadge';
import { ROOM_STATUS } from '../../constants/room.types';
import styles from './RoomCard.module.css';

// Dicionário direto de traduções (fallback caso o useRooms não traduza)
const DIRECT_TRANSLATIONS = {
  description: {
    'rooms.descriptions.cozy_garden': { pt: 'Quarto aconchegante com vista para o jardim, ideal para casais.', en: 'Cozy room with garden view, ideal for couples.' },
    'rooms.descriptions.spacious_balcony': { pt: 'Quarto espaçoso com varanda privativa e amenities premium.', en: 'Spacious room with private balcony and premium amenities.' },
    'rooms.descriptions.deluxe_panoramic': { pt: 'Quarto deluxe com vista panorâmica e acabamentos de luxo.', en: 'Deluxe room with panoramic view and luxury finishes.' }
  },
  bedType: {
    'rooms.beds.queen': { pt: 'Cama de casal queen', en: 'Queen bed' },
    'rooms.beds.mixed': { pt: '2 camas de solteiro + 1 cama de casal', en: '2 single beds + 1 double bed' },
    'rooms.beds.three_single': { pt: '3 camas de solteiro', en: '3 single beds' }
  },
  typeLabel: {
    'rooms.types.standard': { pt: 'Standard', en: 'Standard' },
    'rooms.types.deluxe': { pt: 'Deluxe', en: 'Deluxe' }
  }
};

const RoomCard = ({ room, onSelect, onDetails, isSelected = false }) => {
  const { t, language } = useI18n();

  const [currentImage, setCurrentImage] = useState(room.images?.main || room.images?.[0]);
  const [imageError, setImageError] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  // ==========================================================================
  // FUNÇÃO DE TRADUÇÃO FORÇADA
  // ==========================================================================
  
  const translateText = (text) => {
    if (!text) return '';
    
    // Se o texto já é uma chave (começa com 'rooms.')
    if (typeof text === 'string' && text.startsWith('rooms.')) {
      // Tentar usar o sistema i18n primeiro
      const translated = t(text);
      // Se o sistema i18n retornou a mesma chave (não encontrou), usar dicionário direto
      if (translated === text) {
        const category = text.split('.')[1]; // 'descriptions', 'beds', 'types'
        const key = text;
        if (DIRECT_TRANSLATIONS[category] && DIRECT_TRANSLATIONS[category][key]) {
          return DIRECT_TRANSLATIONS[category][key][language] || text;
        }
      }
      return translated;
    }
    
    // Se o texto parece ser uma chave mas não tem 'rooms.' prefixo
    if (typeof text === 'string' && text.includes('.')) {
      const translated = t(text);
      if (translated !== text) return translated;
    }
    
    return text;
  };

  // Traduzir os campos do quarto
  const translatedDescription = translateText(room.description || room.descriptionKey);
  const translatedBedType = translateText(room.bedType || room.bedTypeKey);
  const translatedTypeLabel = translateText(room.typeLabel || room.typeLabelKey);

  // Traduzir amenities
  const translatedAmenities = (room.amenities || room.amenitiesKeys || []).map(amenity => {
    if (typeof amenity === 'string' && amenity.startsWith('rooms.')) {
      const translated = t(amenity);
      return translated !== amenity ? translated : amenity.replace('rooms.amenities.', '').replace('_', ' ');
    }
    return amenity;
  });

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

  const formattedPrice = new Intl.NumberFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency: room.price?.currency || 'MZN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(room.price?.amount || room.price_per_night || 0);

  const isAvailable = room.status === ROOM_STATUS.AVAILABLE;

  const galleryImages = room.images?.gallery || room.images?.slice(1) || [];
  const mainImage = room.images?.main || room.images?.[0];

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <article
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
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
            <h3 className={styles.title}>
              {t('rooms.room')} {room.number || room.room_number}
            </h3>
            <p className={styles.roomType}>{translatedTypeLabel}</p>
          </div>
          <div className={styles.price}>
            <span className={styles.priceAmount}>{formattedPrice}</span>
            <span className={styles.pricePeriod}>{t('rooms.per_night')}</span>
          </div>
        </div>

        <p className={styles.description}>{translatedDescription}</p>

        <div className={styles.detailItem}>
          <span className={styles.detailIcon}>👥</span>
          <span>{room.capacity || 2} {t('rooms.guests')}</span>
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
          <Button variant="outline" size="sm" onClick={handleDetails} className={styles.detailsButton}>
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
