import React, { useState, useEffect } from 'react';
import styles from './HotelCarousel.module.css';

const images = [
  { src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop', title: 'Piscina do Hotel' },
  { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop', title: 'Gastronomia' },
  { src: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=500&fit=crop', title: 'Bebidas Exclusivas' },
  { src: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=500&fit=crop', title: 'Vista Paradisíaca' },
  { src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=500&fit=crop', title: 'Academia Moderna' },
];

// Duplicar imagens para efeito infinito
const extendedImages = [...images, ...images, ...images];
const OFFSET = images.length; // índice onde começa a "cópia real"
const ITEMS_PER_VIEW = 2;     // mostrar 2 imagens por vez

const HotelCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(OFFSET);
  const [transitioning, setTransitioning] = useState(false);

  // Navegar para próxima página (2 imagens)
  const goToNext = () => {
    if (transitioning) return;
    setTransitioning(true);
    setCurrentIndex(prev => prev + ITEMS_PER_VIEW);
  };

  // Navegar para página anterior
  const goToPrevious = () => {
    if (transitioning) return;
    setTransitioning(true);
    setCurrentIndex(prev => prev - ITEMS_PER_VIEW);
  };

  // Resetar posição para loop infinito após transição
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

  // Auto-play
  useEffect(() => {
    const interval = setInterval(goToNext, 4000);
    return () => clearInterval(interval);
  }, []);

  // Calcular página atual para os dots
  const getCurrentPage = () => {
    const realIndex = ((currentIndex - OFFSET) % images.length + images.length) % images.length;
    return Math.floor(realIndex / ITEMS_PER_VIEW);
  };

  const totalPages = Math.ceil(images.length / ITEMS_PER_VIEW);

  return (
    <section className={styles.carouselSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Galeria do Hotel</h2>
          <p className={styles.subtitle}>Conheça nossas instalações</p>
        </div>

        <div className={styles.carouselWrapper}>
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
                    <img src={img.src} alt={img.title} className={styles.image} />
                    <div className={styles.imageOverlay}>
                      <span className={styles.imageLabel}>{img.title}</span>
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
              onClick={() => setCurrentIndex(OFFSET + idx * ITEMS_PER_VIEW)}
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
