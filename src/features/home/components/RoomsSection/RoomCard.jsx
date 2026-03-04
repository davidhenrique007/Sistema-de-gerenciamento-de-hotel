import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../shared/components/ui/Button';
import RoomStatusBadge from './RoomStatusBadge';
import { ROOM_STATUS } from '../../constants/room.types';
import styles from './RoomCard.module.css';

/**
 * RoomCard Component - Card de exibição de quarto
 * 
 * @component
 * @example
 * <RoomCard
 *   room={room}
 *   onSelect={handleSelect}
 *   isSelected={false}
 * />
 */
const RoomCard = ({ room, onSelect, isSelected = false }) => {
  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleSelect = () => {
    if (room.status === ROOM_STATUS.AVAILABLE && onSelect) {
      onSelect(room);
    }
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
    >
      <div className={styles.imageContainer}>
        <img
          src={room.image}
          alt={`Quarto ${room.number}`}
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.statusContainer}>
          <RoomStatusBadge status={room.status} size="sm" />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <h3 id={`room-title-${room.id}`} className={styles.title}>
              Quarto {room.number}
            </h3>
            <p className={styles.type}>{room.typeLabel || room.type}</p>
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
            <span>{room.bedType || 'Cama de casal'}</span>
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

        <div className={styles.action}>
          <Button
            variant={isAvailable ? 'primary' : 'secondary'}
            size="md"
            fullWidth
            onClick={handleSelect}
            disabled={!isAvailable}
            aria-label={isAvailable ? `Selecionar quarto ${room.number}` : `Quarto ${room.number} indisponível`}
          >
            {isAvailable ? 'Selecionar Quarto' : 'Indisponível'}
          </Button>
        </div>
      </div>
    </article>
  );
};

RoomCard.propTypes = {
  /** Dados do quarto */
  room: PropTypes.shape({
    id: PropTypes.string.isRequired,
    number: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    typeLabel: PropTypes.string,
    capacity: PropTypes.number.isRequired,
    price: PropTypes.shape({
      amount: PropTypes.number.isRequired,
      currency: PropTypes.string.isRequired,
    }).isRequired,
    status: PropTypes.oneOf(['available', 'occupied', 'maintenance']).isRequired,
    amenities: PropTypes.arrayOf(PropTypes.string).isRequired,
    image: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    size: PropTypes.number,
    bedType: PropTypes.string,
  }).isRequired,
  /** Função chamada ao selecionar o quarto */
  onSelect: PropTypes.func,
  /** Indica se o quarto está selecionado */
  isSelected: PropTypes.bool,
};

RoomCard.defaultProps = {
  onSelect: undefined,
  isSelected: false,
};

export default memo(RoomCard);