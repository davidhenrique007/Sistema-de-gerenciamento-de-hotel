import React, { memo } from 'react';
import PropTypes from 'prop-types';
import RoomGridItem from './RoomGridItem';
import styles from './RoomGrid.module.css';

/**
 * RoomGrid Component - Grid responsivo de quartos
 */
const RoomGrid = ({ rooms, selectedRoomId, onSelect, onDetails, columns = 3 }) => {
  if (!rooms || rooms.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateText}>
          Nenhum quarto disponível no momento.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`${styles.grid} ${styles[`columns-${columns}`]}`}
      role="grid"
      aria-label="Lista de quartos"
    >
      {rooms.map((room) => (
        <RoomGridItem
          key={room.id}
          room={room}
          isSelected={selectedRoomId === room.id}
          onSelect={onSelect}
          onDetails={onDetails}
        />
      ))}
    </div>
  );
};

RoomGrid.propTypes = {
  rooms: PropTypes.array.isRequired,
  selectedRoomId: PropTypes.string,
  onSelect: PropTypes.func,
  onDetails: PropTypes.func,
  columns: PropTypes.oneOf([1, 2, 3, 4]),
};

RoomGrid.defaultProps = {
  selectedRoomId: null,
  onSelect: undefined,
  onDetails: undefined,
  columns: 3,
};

export default memo(RoomGrid);