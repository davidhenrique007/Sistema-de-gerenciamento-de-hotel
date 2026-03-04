import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../shared/components/ui/Button';
import HeroBackground from './HeroBackground';
import styles from './Hero.module.css';

/**
 * Hero Component - Banner principal da HomePage
 * 
 * @component
 * @example
 * <Hero
 *   title="Hotel Paradise"
 *   subtitle="O paraíso perfeito para suas férias"
 *   ctaText="Reservar Agora"
 *   onCtaClick={scrollToForm}
 * />
 */
const Hero = ({
  title = 'Hotel Paradise',
  subtitle = 'O paraíso perfeito para suas férias dos sonhos',
  ctaText = 'Reservar Agora',
  backgroundImage = '/assets/images/hero-bg.jpg',
  overlay = true,
  parallax = false,
  onCtaClick,
  className = '',
}) => {
  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <section className={`${styles.hero} ${className}`}>
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
              aria-label="Rolar para o formulário de reserva"
            >
              {ctaText}
            </Button>
          </div>
        </div>
      </div>

      {/* Indicador de scroll */}
      <div className={styles.scrollIndicator} aria-hidden="true">
        <span className={styles.scrollText}>Scroll</span>
        <div className={styles.scrollArrow} />
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
  /** URL da imagem de fundo */
  backgroundImage: PropTypes.string,
  /** Mostrar overlay escuro */
  overlay: PropTypes.bool,
  /** Efeito parallax */
  parallax: PropTypes.bool,
  /** Função chamada ao clicar no CTA */
  onCtaClick: PropTypes.func,
  /** Classes CSS adicionais */
  className: PropTypes.string,
};

Hero.defaultProps = {
  title: 'Hotel Paradise',
  subtitle: 'O paraíso perfeito para suas férias dos sonhos',
  ctaText: 'Reservar Agora',
  backgroundImage: '/assets/images/hero-bg.jpg',
  overlay: true,
  parallax: false,
  onCtaClick: undefined,
  className: '',
};

export default memo(Hero);