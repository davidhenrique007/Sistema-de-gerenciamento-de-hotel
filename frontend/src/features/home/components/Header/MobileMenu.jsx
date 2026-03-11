import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import navigationLinks from '../../constants/navigation';
import styles from './Header.module.css';

/**
 * MobileMenu Component - Menu hamburger para dispositivos móveis
 * 
 * @component
 * @example
 * <MobileMenu isOpen={isOpen} onClose={handleClose} />
 */
const MobileMenu = ({ isOpen, onClose, className = '' }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  // ==========================================================================
  // FECHAR AO CLICAR FORA
  // ==========================================================================

  const handleClickOutside = useCallback((event) => {
    if (
      menuRef.current && 
      !menuRef.current.contains(event.target) &&
      triggerRef.current && 
      !triggerRef.current.contains(event.target)
    ) {
      onClose();
    }
  }, [onClose]);

  // ==========================================================================
  // FECHAR COM ESC
  // ==========================================================================

  const handleEscKey = useCallback((event) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // ==========================================================================
  // BLOQUEAR SCROLL E ADICIONAR LISTENERS
  // ==========================================================================

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
      
      setIsAnimating(true);
    } else {
      document.body.style.overflow = '';
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);

      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, handleClickOutside, handleEscKey]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleLinkClick = () => {
    onClose();
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  if (!isOpen && !isAnimating) return null;

  return (
    <>
      <button
        ref={triggerRef}
        className={`${styles.menuToggle} ${isOpen ? styles.open : ''}`}
        onClick={onClose}
        aria-label="Fechar menu"
        aria-expanded={isOpen}
        type="button"
      >
        <span className={styles.hamburgerIcon} />
      </button>

      <div
        ref={menuRef}
        className={`
          ${styles.mobileMenu}
          ${isOpen ? styles.open : styles.closed}
          ${className}
        `}
        aria-modal="true"
        role="dialog"
      >
        <nav className={styles.mobileNav} aria-label="Navegação mobile">
          <ul className={styles.mobileNavList}>
            {navigationLinks.map((link) => (
              <li key={link.id} className={styles.mobileNavItem}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) => 
                    `${styles.mobileNavLink} ${isActive ? styles.active : ''}`
                  }
                  onClick={handleLinkClick}
                  end={link.exact}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

MobileMenu.propTypes = {
  /** Controla a abertura do menu */
  isOpen: PropTypes.bool.isRequired,
  /** Função chamada ao fechar */
  onClose: PropTypes.func.isRequired,
  /** Classes CSS adicionais */
  className: PropTypes.string,
};

MobileMenu.defaultProps = {
  className: '',
};

export default React.memo(MobileMenu);