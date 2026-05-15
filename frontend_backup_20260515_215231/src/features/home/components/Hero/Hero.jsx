// frontend/src/features/home/components/Hero/Hero.jsx
import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { useI18n } from '../../../../contexts/I18nContext';
import Button from '../../../../shared/components/ui/Button';
import HeroBackground from './HeroBackground';
import styles from './Hero.module.css';

const Hero = ({
  title: propTitle,
  subtitle: propSubtitle,
  ctaText: propCtaText,
  backgroundImage = '/assets/images/hero-bg.jpg',
  overlay = true,
  parallax = false,
  size = 'large',
  onCtaClick,
  className = '',
}) => {
  const { t } = useI18n();
  
  // Usar prop se fornecida, senão usar tradução
  const title = propTitle || t('hero.title');
  const subtitle = propSubtitle || t('hero.subtitle');
  const ctaText = propCtaText || t('hero.cta');
  
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
          <h1 className={styles.title}>
            <span className={styles.gradientText}>{title}</span>
          </h1>
          <p className={`${styles.subtitle} ${styles.pulseText}`}>{subtitle}</p>
          
          <div className={styles.cta}>
            <Button
              variant="primary"
              size="lg"
              onClick={onCtaClick}
              className={styles.ctaButton}
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
  size: 'medium',
  onCtaClick: undefined,
  className: '',
};

export default memo(Hero);