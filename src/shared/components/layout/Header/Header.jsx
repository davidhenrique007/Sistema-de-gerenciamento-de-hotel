// ============================================
// COMPONENT: Header
// ============================================
// Responsabilidade: Cabeçalho reutilizável com navegação responsiva
// Acessibilidade: ARIA labels, navegação por teclado, foco visível
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import styles from './Header.module.css';

// ============================================
// CONSTANTES
// ============================================

const navigationItems = [
  { id: 'home', label: 'Início', path: '/' },
  { id: 'rooms', label: 'Quartos', path: '/quartos' },
  { id: 'services', label: 'Serviços', path: '/servicos' },
  { id: 'about', label: 'Sobre', path: '/sobre' },
  { id: 'contact', label: 'Contato', path: '/contato' }
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const Header = ({ 
  logo = 'Hotel Paradise',
  onNavigate,
  currentPath = '/',
  transparent = false,
  fixed = true
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // ========================================
  // EFEITOS
  // ========================================

  // Detectar scroll para mudar aparência
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fechar menu ao redimensionar para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Bloquear scroll quando menu mobile está aberto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // ========================================
  // HANDLERS
  // ========================================

  const handleNavigation = (path) => (e) => {
    e.preventDefault();
    setIsMenuOpen(false);
    
    if (onNavigate) {
      onNavigate(path);
    } else {
      // Fallback para navegação padrão
      window.location.href = path;
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleKeyDown = (e) => {
    // Fechar menu com ESC
    if (e.key === 'Escape' && isMenuOpen) {
      setIsMenuOpen(false);
      // Retornar foco ao botão do menu
      buttonRef.current?.focus();
    }
  };

  // ========================================
  // RENDER
  // ========================================

  const headerClasses = [
    styles.header,
    fixed ? styles.fixed : '',
    transparent && !scrolled ? styles.transparent : '',
    scrolled ? styles.scrolled : '',
    isMenuOpen ? styles.menuOpen : ''
  ].filter(Boolean).join(' ');

  return (
    <header 
      className={headerClasses}
      role="banner"
      onKeyDown={handleKeyDown}
    >
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo}>
          <a 
            href="/" 
            onClick={handleNavigation('/')}
            aria-label="Página inicial"
            className={styles.logoLink}
          >
            <span className={styles.logoText}>{logo}</span>
          </a>
        </div>

        {/* Botão Menu Mobile */}
        <button
          ref={buttonRef}
          className={styles.menuButton}
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-controls="main-navigation"
        >
          <span className={styles.menuIcon}>
            <span className={styles.menuIconLine}></span>
            <span className={styles.menuIconLine}></span>
            <span className={styles.menuIconLine}></span>
          </span>
        </button>

        {/* Navegação */}
        <nav
          id="main-navigation"
          ref={menuRef}
          className={`${styles.navigation} ${isMenuOpen ? styles.navigationOpen : ''}`}
          aria-label="Principal"
          role="navigation"
        >
          <ul className={styles.navList}>
            {navigationItems.map((item) => (
              <li key={item.id} className={styles.navItem}>
                <a
                  href={item.path}
                  onClick={handleNavigation(item.path)}
                  className={`${styles.navLink} ${
                    currentPath === item.path ? styles.active : ''
                  }`}
                  aria-current={currentPath === item.path ? 'page' : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Overlay para menu mobile */}
        {isMenuOpen && (
          <div 
            className={styles.overlay}
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </div>
    </header>
  );
};

// PropTypes (opcional, mas recomendado para documentação)
Header.displayName = 'Header';