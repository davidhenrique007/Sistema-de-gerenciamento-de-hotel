import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useI18n } from '../../../../contexts/I18nContext'; // ✅ ADICIONADO
import useRooms from '../../hooks/useRooms';
import useRoomSelection from '../../hooks/useRoomSelection';
import RoomGrid from './RoomGrid';
import Spinner from '../../../../shared/components/ui/Spinner';
import Button from '../../../../shared/components/ui/Button';
import styles from './RoomsSection.module.css';

/**
 * RoomsSection Component - Seção principal de quartos
 */
const RoomsSection = ({ onSelectRoom, onDetailsRoom, title: propTitle, subtitle: propSubtitle }) => {
  const { t } = useI18n(); // ✅ ADICIONADO
  const { rooms, isLoading, error, stats, getAvailableRooms } = useRooms();
  const { selectedRoomId, selectRoom } = useRoomSelection(rooms);
  const [filter, setFilter] = useState('all');

  // Usar props ou traduções
  const title = propTitle || t('rooms.title');
  const subtitle = propSubtitle || t('rooms.subtitle');

  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
  }, []);

  const handleSelectRoom = useCallback(
    (room) => {
      selectRoom(room);
      if (onSelectRoom) {
        onSelectRoom(room);
      }
    },
    [selectRoom, onSelectRoom]
  );

  const handleDetailsRoom = useCallback(
    (room) => {
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
            <p className={styles.loadingText}>{t('common.loading')}</p>
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
              {t('common.retry')}
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
              <strong>{stats.total || rooms?.length || 0}</strong> {t('rooms.room_types')}
            </span>
            <span className={styles.statItem}>
              🏨 {stats.available || rooms?.filter(r => r.status === 'available').length || 0} {t('rooms.available_units')}
            </span>

            <div className={styles.filters}>
              <button
                className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
                onClick={() => handleFilterChange('all')}
              >
                {t('rooms.all')}
              </button>
              <button
                className={`${styles.filterButton} ${filter === 'available' ? styles.active : ''}`}
                onClick={() => handleFilterChange('available')}
              >
                {t('rooms.available')}
              </button>
            </div>
          </div>
        </div>

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
};

export default React.memo(RoomsSection);