import React, { memo } from 'react';
import PropTypes from 'prop-types';
import RoomCard from './RoomCard';
import styles from './RoomGrid.module.css';

/**
 * RoomGridItem Component - Célula do grid que encapsula um RoomCard
 * 
 * @component
 * @example
 * <RoomGridItem
 *   room={room}
 *   isSelected={true}
 *   onSelect={handleSelect}
 * />
 */
const RoomGridItem = ({ room, isSelected, onSelect }) => {
  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleSelect = () => {
    if (onSelect) {
      onSelect(room);
    }
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div
      className={`${styles.gridItem} ${isSelected ? styles.selected : ''}`}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      onClick={handleSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect();
        }
      }}
    >
      <RoomCard
        room={room}
        onSelect={onSelect}
        isSelected={isSelected}
      />
    </div>
  );
};

RoomGridItem.propTypes = {
  /** Dados do quarto */
  room: PropTypes.object.isRequired,
  /** Indica se o quarto está selecionado */
  isSelected: PropTypes.bool,
  /** Função chamada ao selecionar o quarto */
  onSelect: PropTypes.func,
};

RoomGridItem.defaultProps = {
  isSelected: false,
  onSelect: undefined,
};

export default memo(RoomGridItem);