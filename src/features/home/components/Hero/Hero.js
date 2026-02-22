// ============================================
// COMPONENT: Hero
// ============================================
// Responsabilidade: Seção principal (Hero) da Home Page
// Acessibilidade: Estrutura semântica, ARIA labels, contraste adequado
// Performance: Lazy loading de imagem, componente puro
// ============================================

import React, { useState, useEffect } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../../../../shared/components/ui';
import styles from './Hero.module.css';

// ============================================
// CONSTANTES
// ============================================

const DEFAULT_IMAGE = '/assets/images/hero/hotel-paradise-hero.jpg';
const DEFAULT_TITLE = 'Hotel Paradise';
const DEFAULT_SUBTITLE = 'O paraíso perfeito para suas férias dos sonhos';
const DEFAULT_CTA_TEXT = 'Reservar Agora';
const DEFAULT_CTA_ACTION = '/quartos';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const Hero = ({
  // Conteúdo
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  ctaText = DEFAULT_CTA_TEXT,
  ctaAction = DEFAULT_CTA_ACTION,
  
  // Imagem
  imageSrc = DEFAULT_IMAGE,
  imageAlt = 'Vista paradisíaca do Hotel Paradise com piscina e mar ao fundo',
  
  // Overlay
  overlayOpacity = 0.4,
  overlayColor = 'dark',
  
  // Alinhamento
  align = 'center', // 'left', 'center', 'right'
  
  // Ações
  onCtaClick,
  
  // Classes adicionais
  className = '',
  
  // Props adicionais
  ...props
}) => {
  // ========================================
  // ESTADOS
  // ========================================
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // ========================================
  // HANDLERS DE IMAGEM
  // ========================================
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    console.error(`Erro ao carregar imagem: ${imageSrc}`);
  };

  // ========================================
  // HANDLER DO CTA
  // ========================================
  
  const handleCtaClick = (e) => {
    if (onCtaClick) {
      e.preventDefault();
      onCtaClick();
    }
    // Se não tiver onCtaClick, o link seguirá o href normal
  };

  // ========================================
  // CLASSES CSS
  // ========================================
  
  const heroClasses = [
    styles.hero,
    styles[`align-${align}`],
    imageLoaded ? styles.imageLoaded : styles.imageLoading,
    imageError && styles.imageError,
    className
  ].filter(Boolean).join(' ');

  const overlayClasses = [
    styles.overlay,
    styles[`overlay-${overlayColor}`]
  ].filter(Boolean).join(' ');

  // ========================================
  // RENDER
  // ========================================
  
  return (
    <section 
      className={heroClasses}
      aria-label="Seção principal de boas-vindas"
      {...props}
    >
      {/* Imagem de fundo com lazy loading */}
      <div className={styles.imageContainer}>
        {!imageLoaded && !imageError && (
          <div className={styles.imagePlaceholder} aria-hidden="true">
            <span className={styles.loadingIndicator}>Carregando...</span>
          </div>
        )}
        
        <img
          src={imageSrc}
          alt={imageAlt}
          className={styles.backgroundImage}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
          aria-hidden="true"
        />
      </div>

      {/* Overlay para melhorar contraste */}
      <div 
        className={overlayClasses}
        style={{ opacity: overlayOpacity }}
        aria-hidden="true"
      />

      {/* Conteúdo */}
      <div className={styles.content}>
        <div className={styles.contentInner}>
          <h1 className={styles.title}>
            {title}
          </h1>
          
          <p className={styles.subtitle}>
            {subtitle}
          </p>
          
          <div className={styles.ctaContainer}>
            <Button
              as="a"
              href={ctaAction}
              variant={ButtonVariant.PRIMARY}
              size={ButtonSize.LARGE}
              onClick={handleCtaClick}
              aria-label={`${ctaText} - Navegar para página de reservas`}
              className={styles.ctaButton}
            >
              {ctaText}
            </Button>
          </div>
        </div>
      </div>

      {/* Skip link para acessibilidade */}
      <a href="#main-content" className={styles.skipLink}>
        Pular para o conteúdo principal
      </a>
    </section>
  );
};

Hero.displayName = 'Hero';

// ============================================
// COMPONENTES DERIVADOS
// ============================================

/**
 * HeroCompact - Versão reduzida para páginas internas
 */
export const HeroCompact = (props) => {
  return (
    <Hero
      {...props}
      overlayOpacity={0.3}
      className={styles.compact}
    />
  );
};

HeroCompact.displayName = 'HeroCompact';

/**
 * HeroWithVideo - Versão com vídeo de fundo
 */
export const HeroWithVideo = ({
  videoSrc,
  videoPoster,
  ...props
}) => {
  return (
    <Hero
      {...props}
      className={styles.withVideo}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={videoPoster}
        className={styles.backgroundVideo}
        aria-hidden="true"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
    </Hero>
  );
};

HeroWithVideo.displayName = 'HeroWithVideo';