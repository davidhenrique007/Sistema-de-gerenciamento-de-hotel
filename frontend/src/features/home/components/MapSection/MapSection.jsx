import React from 'react';
import { useI18n } from '../../../../contexts/I18nContext';
import styles from './MapSection.module.css';

const MapSection = () => {
  const { t } = useI18n();

  const mapSrc = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4060.866777340324!2d32.573175!3d-25.969234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ee512b3c9e9e9e9%3A0x9e9e9e9e9e9e9e9e!2sMaputo!5e0!3m2!1spt!2smz!4v1700000000000!5m2!1spt!2smz";

  return (
    <section className={styles.mapSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('map.title')}</h2>
          <p className={styles.subtitle}>{t('map.subtitle')}</p>
          <p className={styles.description}>{t('map.description')}</p>
        </div>
        
        <div className={styles.mapWrapper}>
          <iframe
            src={mapSrc}
            title={t('map.title')}
            className={styles.map}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
};

export default MapSection;
