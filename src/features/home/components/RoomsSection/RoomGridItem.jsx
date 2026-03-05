import React, { memo } from 'react';
import PropTypes from 'prop-types';
import RoomCard from './RoomCard';
import styles from './RoomGrid.module.css';

/**
 * RoomGridItem Component - Célula do grid que encapsula um RoomCard
 */
const RoomGridItem = ({ room, isSelected, onSelect, onDetails }) => {
  return (
    <div
      className={`${styles.gridItem} ${isSelected ? styles.selected : ''}`}
    >
      <RoomCard
        room={room}
        isSelected={isSelected}
        onSelect={onSelect}
        onDetails={onDetails}
      />
    </div>
  );
};

RoomGridItem.propTypes = {
  room: PropTypes.object.isRequired,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func,
  onDetails: PropTypes.func,
};

RoomGridItem.defaultProps = {
  isSelected: false,
  onSelect: undefined,
  onDetails: undefined,
};

export default memo(RoomGridItem);