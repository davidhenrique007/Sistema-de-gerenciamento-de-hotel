import React, { memo } from 'react';
import { useI18n } from '../../../../contexts/I18nContext';
import PropTypes from 'prop-types';
import styles from './GuestSelector.module.css';

const GuestSelector = ({ guests, onChange, label }) => {
  const { t } = useI18n();

  const updateGuests = (type, delta) => {
    const newValue = Math.max(type === 'adults' ? 1 : 0, guests[type] + delta);
    onChange({ ...guests, [type]: newValue });
  };

  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}
      
      <div className={styles.selectors}>
        <div className={styles.selector}>
          <span className={styles.selectorLabel}>{t('reservation.adults')}</span>
          <div className={styles.counter}>
            <button type="button" onClick={() => updateGuests('adults', -1)} disabled={guests.adults <= 1} className={styles.counterButton}>−</button>
            <span className={styles.counterValue}>{guests.adults}</span>
            <button type="button" onClick={() => updateGuests('adults', 1)} className={styles.counterButton}>+</button>
          </div>
        </div>
        
        <div className={styles.selector}>
          <span className={styles.selectorLabel}>{t('reservation.children')}</span>
          <div className={styles.counter}>
            <button type="button" onClick={() => updateGuests('children', -1)} disabled={guests.children <= 0} className={styles.counterButton}>−</button>
            <span className={styles.counterValue}>{guests.children}</span>
            <button type="button" onClick={() => updateGuests('children', 1)} className={styles.counterButton}>+</button>
          </div>
        </div>
      </div>
    </div>
  );
};

GuestSelector.propTypes = {
  guests: PropTypes.shape({
    adults: PropTypes.number,
    children: PropTypes.number
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string
};

GuestSelector.defaultProps = {
  label: ''
};

export default memo(GuestSelector);
