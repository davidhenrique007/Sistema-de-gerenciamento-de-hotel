import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import useRooms from '../../hooks/useRooms';
import useRoomSelection from '../../hooks/useRoomSelection';
import RoomGrid from './RoomGrid';
import Spinner from '../../../../shared/components/ui/Spinner';
import Button from '../../../../shared/components/ui/Button';
import styles from './RoomsSection.module.css';

/**
 * RoomsSection Component - Seção principal de quartos
 */
const RoomsSection = ({ onSelectRoom, onDetailsRoom, title, subtitle }) => {
  const { rooms, isLoading, error, stats, getAvailableRooms } = useRooms();
  const { selectedRoomId, selectRoom } = useRoomSelection(rooms);
  const [filter, setFilter] = useState('all');

  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
  }, []);

  const handleSelectRoom = useCallback(
    (room) => {
      console.log('?? handleSelectRoom FOI CHAMADO!', room);
      console.log('?? Quarto selecionado no RoomsSection:', room);
      selectRoom(room);
      if (onSelectRoom) {
        onSelectRoom(room);
      }
    },
    [selectRoom, onSelectRoom]
  );

  const handleDetailsRoom = useCallback(
    (room) => {
      console.log('?? Detalhes do quarto:', room);
      if (onDetailsRoom) {
        onDetailsRoom(room);
      }
    },
    [onDetailsRoom]
  );

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  const filteredRooms = filter === 'available' ? getAvailableRooms() : rooms;

  if (isLoading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <Spinner size="lg" />
            <p className={styles.loadingText}>Carregando quartos...</p>
          </div>
        </div>
      </section>
    );
  }

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

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>

          <div className={styles.stats}>
            <span className={styles.statItem}>
              <strong>{stats.total}</strong> Tipos de Quartos
            </span>
            <span className={styles.statItem}>🏨 43 unidades prontas para reserva imediata</span>

            <div className={styles.filters}>
              <button
                className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
                onClick={() => handleFilterChange('all')}
              >
                Todos
              </button>
              <button
                className={`${styles.filterButton} ${filter === 'available' ? styles.active : ''}`}
                onClick={() => handleFilterChange('available')}
              >
                Disponíveis
              </button>
            </div>
          </div>
        </div>

        {/* ? CORRIGIDO: APENAS UMA VEZ onSelect e onDetails */}
        <RoomGrid
          rooms={filteredRooms}
          selectedRoomId={selectedRoomId}
          onSelect={handleSelectRoom}
          onDetails={handleDetailsRoom}
          columns={3}
        />
      </div>
    </section>
  );
};

RoomsSection.propTypes = {
  onSelectRoom: PropTypes.func,
  onDetailsRoom: PropTypes.func,
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

RoomsSection.defaultProps = {
  onSelectRoom: undefined,
  onDetailsRoom: undefined,
  title: 'Nossos Quartos',
  subtitle: 'Escolha o quarto perfeito para sua estadia',
};

export default React.memo(RoomsSection);
