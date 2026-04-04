import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../shared/components/ui/Button';
import HeroBackground from './HeroBackground';
import styles from './Hero.module.css';

const Hero = ({
  title = 'Hotel Paradise',
  subtitle = 'O paraíso perfeito para suas férias dos sonhos',
  ctaText = 'Reservar Agora',
  backgroundImage = '/assets/images/hero-bg.jpg',
  overlay = true,
  parallax = false,
  size = 'large', // 'small', 'medium', 'large'
  onCtaClick,
  className = '',
}) => {
  // Mapeamento de tamanhos
  const sizeClasses = {
    small: styles.heroSmall,
    medium: styles.heroMedium,
    large: styles.heroLarge,
  };

  return (
    <section className={`${styles.hero} ${sizeClasses[size]} ${className}`}>
      <HeroBackground
        image={backgroundImage}
        overlay={overlay}
        parallax={parallax}
      />
      
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
          
          <div className={styles.cta}>
            <Button
              variant="primary"
              size="lg"
              onClick={onCtaClick}
            >
              {ctaText}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

Hero.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  ctaText: PropTypes.string,
  backgroundImage: PropTypes.string,
  overlay: PropTypes.bool,
  parallax: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  onCtaClick: PropTypes.func,
  className: PropTypes.string,
};

Hero.defaultProps = {
  title: 'Hotel Paradise',
  subtitle: 'O paraíso perfeito para suas férias dos sonhos',
  ctaText: 'Reservar Agora',
  backgroundImage: '/assets/images/hero-bg.jpg',
  overlay: true,
  parallax: false,
  size: 'medium', // Mudar para 'medium' por padrão
  onCtaClick: undefined,
  className: '',
};

export default memo(Hero);