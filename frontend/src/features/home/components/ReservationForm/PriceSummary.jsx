import React, { memo } from 'react';
import { useI18n } from '../../../../contexts/I18nContext';
import { differenceInDays } from 'date-fns';
import PropTypes from 'prop-types';
import styles from './PriceSummary.module.css';

const PriceSummary = memo(({ checkIn, checkOut, room, services = [] }) => {
  const { t } = useI18n();
  
  const nights = differenceInDays(new Date(checkOut), new Date(checkIn));
  const roomPrice = room?.price?.amount || 0;
  const roomTotal = roomPrice * nights;
  const servicesTotal = services.reduce((sum, s) => sum + (s.price || 0), 0);
  const total = roomTotal + servicesTotal;
  
  return (
    <div className={styles.summary}>
      <h4 className={styles.title}>{t('checkout.reservation_summary')}</h4>
      
      <div className={styles.dates}>
        <div className={styles.dateItem}>
          <span>{t('reservation.checkin')}:</span>
          <strong>{new Date(checkIn).toLocaleDateString()}</strong>
        </div>
        <div className={styles.dateItem}>
          <span>{t('reservation.checkout')}:</span>
          <strong>{new Date(checkOut).toLocaleDateString()}</strong>
        </div>
      </div>
      
      <div className={styles.nights}>
        {nights} {nights === 1 ? t('reservation.night') : t('reservation.nights')}
      </div>
      
      <div className={styles.prices}>
        <div className={styles.priceRow}>
          <span>{room?.typeLabel || room?.type} ({nights} {t('reservation.nights')})</span>
          <span>{roomTotal.toLocaleString()} MZN</span>
        </div>
        
        {services.map(service => (
          <div key={service.id} className={styles.priceRow}>
            <span>{service.name}</span>
            <span>{service.price.toLocaleString()} MZN</span>
          </div>
        ))}
        
        <div className={styles.totalRow}>
          <strong>{t('common.total')}</strong>
          <strong>{total.toLocaleString()} MZN</strong>
        </div>
      </div>
    </div>
  );
});

PriceSummary.displayName = 'PriceSummary';

PriceSummary.propTypes = {
  checkIn: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]).isRequired,
  checkOut: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]).isRequired,
  room: PropTypes.object,
  services: PropTypes.array
};

export default PriceSummary;
