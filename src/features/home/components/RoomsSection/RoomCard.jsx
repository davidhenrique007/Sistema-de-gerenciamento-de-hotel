import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../shared/components/ui/Button';
import RoomStatusBadge from './RoomStatusBadge';
import { ROOM_STATUS } from '../../constants/room.types';
import styles from './RoomCard.module.css';

/**
 * RoomCard Component - Card de exibição de quarto com dois botões
 */
const RoomCard = ({ room, onSelect, onDetails, isSelected = false }) => {
  // ==========================================================================
  // STATES
  // ==========================================================================
  const [currentImage, setCurrentImage] = useState(room.images.main);
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
    currency: room.price.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(room.price.amount);

  const isAvailable = room.status === ROOM_STATUS.AVAILABLE;

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
        {/* Imagem Principal */}
        <img
          src={imageError ? '/assets/images/default-room.jpg' : currentImage}
          onError={handleImageError}
          alt={`Quarto ${room.number}`}
          className={styles.mainImage}
          loading="lazy"
        />

        {/* Miniaturas da Galeria */}
        {showGallery && (
          <div className={styles.thumbnailStrip}>
            <img
              src={room.images.main}
              alt="Principal"
              className={`${styles.thumbnail} ${currentImage === room.images.main ? styles.activeThumbnail : ''}`}
              onClick={() => handleImageClick(room.images.main)}
            />
            {room.images.gallery.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Foto ${index + 1}`}
                className={`${styles.thumbnail} ${currentImage === img ? styles.activeThumbnail : ''}`}
                onClick={() => handleImageClick(img)}
              />
            ))}
          </div>
        )}

        {/* Status Badge */}
        <div className={styles.statusContainer}>
          <RoomStatusBadge status={room.status} size="sm" />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.roomInfo}>
            <h3 id={`room-title-${room.id}`} className={styles.title}>
              Quarto {room.number}
            </h3>
            <p className={styles.roomType}>{room.typeLabel}</p>
          </div>
          <div className={styles.price}>
            <span className={styles.priceAmount}>{formattedPrice}</span>
            <span className={styles.pricePeriod}>/noite</span>
          </div>
        </div>

        <p className={styles.description}>{room.description}</p>

        <div className={styles.details}>
          <div className={styles.detailItem}>
            <span className={styles.detailIcon}>👥</span>
            <span>{room.capacity} {room.capacity === 1 ? 'hóspede' : 'hóspedes'}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailIcon}>📏</span>
            <span>{room.size}m²</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailIcon}>🛏️</span>
            <span>{room.bedType}</span>
          </div>
        </div>

        <div className={styles.amenities}>
          {room.amenities.slice(0, 4).map((amenity, index) => (
            <span key={index} className={styles.amenity}>
              {amenity}
            </span>
          ))}
          {room.amenities.length > 4 && (
            <span className={styles.amenityMore}>
              +{room.amenities.length - 4}
            </span>
          )}
        </div>

        {/* DOIS BOTÕES: DETALHES E SELECIONAR */}
        <div className={styles.buttonGroup}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDetails}
            className={styles.detailsButton}
          >
            Ver Detalhes
          </Button>

          <Button
            variant={isAvailable ? 'primary' : 'secondary'}
            size="sm"
            onClick={handleSelect}
            disabled={!isAvailable}
            className={styles.selectButton}
          >
            {isAvailable ? 'Selecionar' : 'Indisponível'}
          </Button>
        </div>
      </div>
    </article>
  );
};

RoomCard.propTypes = {
  room: PropTypes.shape({
    id: PropTypes.string.isRequired,
    number: PropTypes.string.isRequired,
    typeLabel: PropTypes.string.isRequired,
    capacity: PropTypes.number.isRequired,
    price: PropTypes.shape({
      amount: PropTypes.number.isRequired,
      currency: PropTypes.string.isRequired,
    }).isRequired,
    status: PropTypes.oneOf(['available', 'occupied', 'maintenance']).isRequired,
    amenities: PropTypes.arrayOf(PropTypes.string).isRequired,
    images: PropTypes.shape({
      main: PropTypes.string.isRequired,
      gallery: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
    description: PropTypes.string.isRequired,
    bedType: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
  }).isRequired,
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