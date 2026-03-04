import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-scroll';
import Button from '../../../../shared/components/ui/Button';
import HeroBackground from './HeroBackground';
import styles from './Hero.module.css';

/**
 * Hero Component - Banner principal da home
 * 
 * @component
 * @example
 * <Hero
 *   title="Hotel Paradise"
 *   subtitle="O paraíso perfeito para suas férias"
 *   ctaText="Reservar Agora"
 *   ctaLink="reservation"
 * />
 */
const Hero = ({
  title = 'Hotel Paradise',
  subtitle = 'O paraíso perfeito para suas férias dos sonhos',
  ctaText = 'Reservar Agora',
  ctaLink = 'reservation',
  backgroundImage = '/assets/images/hero-bg.jpg',
  className = '',
  onCtaClick,
}) => {
  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick();
    }
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <section className={`${styles.hero} ${className}`}>
      <HeroBackground image={backgroundImage} overlay={true} />
      
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
          
          <div className={styles.cta}>
            <Link
              to={ctaLink}
              spy={true}
              smooth={true}
              offset={-70}
              duration={500}
              onClick={handleCtaClick}
            >
              <Button
                variant="primary"
                size="lg"
              >
                {ctaText}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

Hero.propTypes = {
  /** Título principal */
  title: PropTypes.string,
  /** Subtítulo */
  subtitle: PropTypes.string,
  /** Texto do botão CTA */
  ctaText: PropTypes.string,
  /** ID da seção para scroll */
  ctaLink: PropTypes.string,
  /** URL da imagem de fundo */
  backgroundImage: PropTypes.string,
  /** Classes CSS adicionais */
  className: PropTypes.string,
  /** Função chamada ao clicar no CTA */
  onCtaClick: PropTypes.func,
};

Hero.defaultProps = {
  title: 'Hotel Paradise',
  subtitle: 'O paraíso perfeito para suas férias dos sonhos',
  ctaText: 'Reservar Agora',
  ctaLink: 'reservation',
  backgroundImage: '/assets/images/hero-bg.jpg',
  className: '',
  onCtaClick: undefined,
};

export default React.memo(Hero);