import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import useRooms from '../../hooks/useRooms';
import useRoomSelection from '../../hooks/useRoomSelection';
import RoomGrid from './RoomGrid';
import Spinner from '../../../../shared/components/ui/Spinner';
import Button from '../../../../shared/components/ui/Button';
import styles from './RoomsSection.module.css';

/**
 * RoomsSection Component - Seção principal de quartos
 * Agora integrada com useRoomSelection
 * 
 * @component
 * @example
 * <RoomsSection onSelectRoom={handleRoomSelect} />
 */
const RoomsSection = ({ onSelectRoom, title, subtitle }) => {
  // ==========================================================================
  // HOOKS
  // ==========================================================================

  const { rooms, isLoading, error, stats, getAvailableRooms } = useRooms();
  const { selectedRoomId, selectRoom } = useRoomSelection(rooms);

  // ==========================================================================
  // STATE
  // ==========================================================================

  const [filter, setFilter] = React.useState('all'); // 'all' | 'available'

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
  }, []);

  const handleSelectRoom = useCallback((room) => {
    selectRoom(room);
    
    // Propagar para componente pai se necessário
    if (onSelectRoom) {
      onSelectRoom(room);
    }
  }, [selectRoom, onSelectRoom]);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  // ==========================================================================
  // FILTERED ROOMS
  // ==========================================================================

  const filteredRooms = filter === 'available'
    ? getAvailableRooms()
    : rooms;

  // ==========================================================================
  // RENDER: LOADING
  // ==========================================================================

  if (isLoading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <Spinner size="lg" />
            <p className={styles.loadingText}>Carregando quartos disponíveis...</p>
          </div>
        </div>
      </section>
    );
  }

  // ==========================================================================
  // RENDER: ERROR
  // ==========================================================================

  if (error) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.errorState}>
            <p className={styles.errorText}>{error}</p>
            <Button variant="primary" onClick={handleRetry}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // ==========================================================================
  // RENDER: SUCCESS
  // ==========================================================================

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>

          {/* Stats e Filtros */}
          <div className={styles.stats}>
            <span className={styles.statItem}>
              <strong>{stats.total}</strong> total
            </span>
            <span className={styles.statItem}>
              <strong>{stats.available}</strong> disponíveis
            </span>
            
            <div className={styles.filters}>
              <button
                className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
                onClick={() => handleFilterChange('all')}
                aria-pressed={filter === 'all'}
              >
                Todos
              </button>
              <button
                className={`${styles.filterButton} ${filter === 'available' ? styles.active : ''}`}
                onClick={() => handleFilterChange('available')}
                aria-pressed={filter === 'available'}
              >
                Disponíveis
              </button>
            </div>
          </div>
        </div>

        {/* Grid de Quartos */}
        <RoomGrid
          rooms={filteredRooms}
          selectedRoomId={selectedRoomId}
          onSelect={handleSelectRoom}
        />

        {/* Informação do quarto selecionado */}
        {selectedRoomId && (
          <div className={styles.selectionInfo}>
            <p className={styles.selectionText}>
              Quarto selecionado: {' '}
              <strong>
                {rooms.find(r => r.id === selectedRoomId)?.number}
              </strong>
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

RoomsSection.propTypes = {
  /** Função chamada ao selecionar um quarto */
  onSelectRoom: PropTypes.func,
  /** Título da seção */
  title: PropTypes.string,
  /** Subtítulo da seção */
  subtitle: PropTypes.string,
};

RoomsSection.defaultProps = {
  onSelectRoom: undefined,
  title: 'Nossos Quartos',
  subtitle: 'Escolha o quarto perfeito para sua estadia',
};

export default React.memo(RoomsSection);