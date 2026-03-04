import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import RoomGridItem from './RoomGridItem';
import styles from './RoomGrid.module.css';

/**
 * RoomGrid Component - Grid responsivo de quartos
 * 
 * @component
 * @example
 * <RoomGrid
 *   rooms={rooms}
 *   selectedRoomId="room-001"
 *   onSelect={handleSelect}
 * />
 */
const RoomGrid = ({ rooms, selectedRoomId, onSelect, columns = 3 }) => {
  // ==========================================================================
  // MEMOIZAR LISTA DE ITEMS
  // ==========================================================================

  const gridItems = useMemo(() => {
    if (!rooms || rooms.length === 0) {
      return null;
    }

    return rooms.map((room) => (
      <RoomGridItem
        key={room.id}
        room={room}
        isSelected={selectedRoomId === room.id}
        onSelect={onSelect}
      />
    ));
  }, [rooms, selectedRoomId, onSelect]);

  // ==========================================================================
  // RENDER: EMPTY STATE
  // ==========================================================================

  if (!rooms || rooms.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateText}>
          Nenhum quarto disponível no momento.
        </p>
      </div>
    );
  }

  // ==========================================================================
  // RENDER: GRID
  // ==========================================================================

  return (
    <div
      className={`${styles.grid} ${styles[`columns-${columns}`]}`}
      role="grid"
      aria-label="Lista de quartos disponíveis"
    >
      {gridItems}
    </div>
  );
};

RoomGrid.propTypes = {
  /** Lista de quartos a serem exibidos */
  rooms: PropTypes.array.isRequired,
  /** ID do quarto selecionado */
  selectedRoomId: PropTypes.string,
  /** Função chamada ao selecionar um quarto */
  onSelect: PropTypes.func,
  /** Número de colunas no grid */
  columns: PropTypes.oneOf([1, 2, 3, 4]),
};

RoomGrid.defaultProps = {
  selectedRoomId: null,
  onSelect: undefined,
  columns: 3,
};

export default memo(RoomGrid);