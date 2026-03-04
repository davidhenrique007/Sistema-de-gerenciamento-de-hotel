import React from 'react';
import PropTypes from 'prop-types';
import { ROOM_STATUS_LABELS, ROOM_STATUS_COLORS } from '../../constants/room.types';
import styles from './RoomCard.module.css';

/**
 * RoomStatusBadge Component - Badge de status do quarto
 * 
 * @component
 * @example
 * <RoomStatusBadge status="available" />
 */
const RoomStatusBadge = ({ status, size = 'md' }) => {
  // ==========================================================================
  // CONSTANTS
  // ==========================================================================

  const statusColor = ROOM_STATUS_COLORS[status] || 'neutral';
  const statusLabel = ROOM_STATUS_LABELS[status] || status;

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <span 
      className={`${styles.statusBadge} ${styles[statusColor]} ${styles[size]}`}
      aria-label={`Status: ${statusLabel}`}
    >
      <span className={styles.statusDot} aria-hidden="true" />
      {statusLabel}
    </span>
  );
};

RoomStatusBadge.propTypes = {
  /** Status do quarto */
  status: PropTypes.oneOf(['available', 'occupied', 'maintenance']).isRequired,
  /** Tamanho do badge */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

RoomStatusBadge.defaultProps = {
  size: 'md',
};

export default React.memo(RoomStatusBadge);