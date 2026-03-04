import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Logo from './Logo';
import NavMenu from './NavMenu';
import MobileMenu from './MobileMenu';
import styles from './Header.module.css';

/**
 * Header Component - Cabeçalho principal da aplicação
 * 
 * @component
 * @example
 * <Header transparent={true} />
 */
const Header = ({ 
  transparent = false,
  sticky = true,
  className = '',
}) => {
  // ==========================================================================
  // ESTADOS
  // ==========================================================================

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ==========================================================================
  // DETECTAR SCROLL
  // ==========================================================================

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ==========================================================================
  // DETECTAR TAMANHO DA TELA
  // ==========================================================================

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLinkClick = () => {
    if (isMobile) {
      handleMobileMenuClose();
    }
  };

  // ==========================================================================
  // CLASSES CSS
  // ==========================================================================

  const headerClasses = [
    styles.header,
    transparent && !scrolled && styles.transparent,
    scrolled && styles.scrolled,
    sticky && styles.sticky,
    className,
  ].filter(Boolean).join(' ');

  const logoVariant = transparent && !scrolled ? 'light' : 'dark';

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <header className={headerClasses}>
      <div className={styles.headerContainer}>
        <Logo variant={logoVariant} />

        {/* Desktop Navigation */}
        {!isMobile && <NavMenu onLinkClick={handleLinkClick} />}

        {/* Mobile Controls */}
        {isMobile && (
          <>
            <button
              className={`${styles.menuToggle} ${isMobileMenuOpen ? styles.open : ''}`}
              onClick={handleMobileMenuToggle}
              aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={isMobileMenuOpen}
              type="button"
            >
              <span className={styles.hamburgerIcon} />
            </button>

            <MobileMenu
              isOpen={isMobileMenuOpen}
              onClose={handleMobileMenuClose}
            />
          </>
        )}
      </div>
    </header>
  );
};

Header.propTypes = {
  /** Header transparente (para hero sections) */
  transparent: PropTypes.bool,
  /** Header fixo no topo */
  sticky: PropTypes.bool,
  /** Classes CSS adicionais */
  className: PropTypes.string,
};

Header.defaultProps = {
  transparent: false,
  sticky: true,
  className: '',
};

export default React.memo(Header);