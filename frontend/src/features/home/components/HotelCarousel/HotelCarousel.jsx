import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useI18n } from '../../../../contexts/I18nContext';
import styles from './HotelCarousel.module.css';

const images = [
  { src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop', titleKey: 'carousel.pool' },
  { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop', titleKey: 'carousel.gastronomy' },
  { src: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=500&fit=crop', titleKey: 'carousel.drinks' },
  { src: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=500&fit=crop', titleKey: 'carousel.view' },
  { src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=500&fit=crop', titleKey: 'carousel.gym' },
];

const extendedImages = [...images, ...images, ...images];
const OFFSET = images.length;
const ITEMS_PER_VIEW = 2;
const totalPages = Math.ceil(images.length / ITEMS_PER_VIEW);

const HotelCarousel = () => {
  const { t } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(OFFSET);
  const [transitioning, setTransitioning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayRef = useRef(null);

  const goToNext = useCallback(() => {
    if (transitioning) return;
    setTransitioning(true);
    setCurrentIndex(prev => prev + ITEMS_PER_VIEW);
  }, [transitioning]);

  const goToPrevious = useCallback(() => {
    if (transitioning) return;
    setTransitioning(true);
    setCurrentIndex(prev => prev - ITEMS_PER_VIEW);
  }, [transitioning]);

  useEffect(() => {
    if (!transitioning) return;
    
    const timer = setTimeout(() => {
      setTransitioning(false);
      
      if (currentIndex >= OFFSET + images.length) {
        setCurrentIndex(OFFSET);
      } else if (currentIndex < OFFSET) {
        setCurrentIndex(OFFSET + images.length - ITEMS_PER_VIEW);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [currentIndex, transitioning]);

  useEffect(() => {
    if (isHovered) {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      return;
    }
    
    autoPlayRef.current = setInterval(() => {
      goToNext();
    }, 4000);
    
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isHovered, goToNext]);

  const getCurrentPage = () => {
    const realIndex = ((currentIndex - OFFSET) % images.length + images.length) % images.length;
    return Math.floor(realIndex / ITEMS_PER_VIEW);
  };

  const goToPage = (pageIndex) => {
    if (transitioning) return;
    setTransitioning(true);
    setCurrentIndex(OFFSET + pageIndex * ITEMS_PER_VIEW);
  };

  return (
    <section className={styles.carouselSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('carousel.title')}</h2>
          <p className={styles.subtitle}>{t('carousel.subtitle')}</p>
        </div>

        <div
          className={styles.carouselWrapper}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={styles.carouselContainer}>
            <div
              className={styles.carouselTrack}
              style={{
                transform: `translateX(-${(currentIndex / ITEMS_PER_VIEW) * 100}%)`,
                transition: transitioning ? 'transform 0.5s ease-in-out' : 'none',
              }}
            >
              {extendedImages.map((img, idx) => (
                <div key={idx} className={styles.carouselSlide}>
                  <div className={styles.imageCard}>
                    <img src={img.src} alt={t(img.titleKey)} className={styles.image} />
                    <div className={styles.imageOverlay}>
                      <span className={styles.imageLabel}>{t(img.titleKey)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={goToPrevious} className={`${styles.navButton} ${styles.prevButton}`}>❮</button>
          <button onClick={goToNext} className={`${styles.navButton} ${styles.nextButton}`}>❯</button>
        </div>

        <div className={styles.dotsContainer}>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              className={`${styles.dot} ${getCurrentPage() === idx ? styles.activeDot : ''}`}
              onClick={() => goToPage(idx)}
            />
          ))}
        </div>

        <div className={styles.pageCounter}>
          <span className={styles.currentPage}>{getCurrentPage() + 1}</span>
          <span className={styles.separator}>/</span>
          <span className={styles.totalPages}>{totalPages}</span>
        </div>
      </div>
    </section>
  );
};

export default HotelCarousel;
