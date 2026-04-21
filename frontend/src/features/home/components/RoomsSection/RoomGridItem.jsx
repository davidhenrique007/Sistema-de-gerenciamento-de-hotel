import React from 'react';
import RoomCard from './RoomCard';
import styles from './RoomGrid.module.css';

const RoomGridItem = ({ room, isSelected, onSelect, onDetails }) => {
  return (
    <div className={`${styles.gridItem} ${isSelected ? styles.selected : ''}`}>
      <RoomCard
        room={room}
        isSelected={isSelected}
        onSelect={onSelect}
        onDetails={onDetails}
      />
      {console.log("?? RoomGridItem - onSelect passada:", !!onSelect)}
    </div>
  );
};

export default RoomGridItem;
