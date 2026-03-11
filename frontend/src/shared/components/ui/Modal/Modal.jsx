import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import Button from '../Button';
import styles from './Modal.module.css';

/**
 * Modal Component - Janela modal acessível com portal
 * 
 * @component
 * @example
 * <Modal isOpen={isOpen} onClose={handleClose} title="Título">
 *   <p>Conteúdo do modal</p>
 * </Modal>
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  closeOnEsc = true,
  className = '',
  ...props
}) => {
  // ==========================================================================
  // REFS
  // ==========================================================================

  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);
  const focusableElements = useRef([]);

  // ==========================================================================
  // TRAP FOCUS - MANTER FOCO DENTRO DO MODAL
  // ==========================================================================

  const trapFocus = useCallback((event) => {
    if (!modalRef.current || !isOpen) return;

    const focusableSelectors = [
      'button',
      '[href]',
      'input',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const elements = modalRef.current.querySelectorAll(focusableSelectors);
    focusableElements.current = Array.from(elements).filter(
      (el) => !el.hasAttribute('disabled') && el.getAttribute('tabindex') !== '-1'
    );

    if (focusableElements.current.length === 0) return;

    const firstElement = focusableElements.current[0];
    const lastElement = focusableElements.current[focusableElements.current.length - 1];

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [isOpen]);

  // ==========================================================================
  // FECHAR AO CLICAR FORA
  // ==========================================================================

  const handleOverlayClick = useCallback((event) => {
    if (closeOnOverlayClick && modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  }, [closeOnOverlayClick, onClose]);

  // ==========================================================================
  // FECHAR COM ESC
  // ==========================================================================

  const handleEscKey = useCallback((event) => {
    if (closeOnEsc && event.key === 'Escape') {
      onClose();
    }
  }, [closeOnEsc, onClose]);

  // ==========================================================================
  // BLOQUEAR SCROLL E ADICIONAR LISTENERS
  // ==========================================================================

  useEffect(() => {
    if (isOpen) {
      // Salvar elemento ativo antes de abrir
      previousActiveElement.current = document.activeElement;

      // Bloquear scroll
      document.body.style.overflow = 'hidden';
      
      // Calcular largura da scrollbar para evitar layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      // Adicionar listeners
      document.addEventListener('mousedown', handleOverlayClick);
      document.addEventListener('keydown', handleEscKey);
      document.addEventListener('keydown', trapFocus);

      // Focar no modal após um pequeno delay
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);

      return () => {
        // Restaurar scroll
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';

        // Remover listeners
        document.removeEventListener('mousedown', handleOverlayClick);
        document.removeEventListener('keydown', handleEscKey);
        document.removeEventListener('keydown', trapFocus);

        // Restaurar foco
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen, handleOverlayClick, handleEscKey, trapFocus]);

  // ==========================================================================
  // NÃO RENDERIZAR SE FECHADO
  // ==========================================================================

  if (!isOpen) return null;

  // ==========================================================================
  // RENDER VIA PORTAL
  // ==========================================================================

  return createPortal(
    <div className={styles.overlay}>
      <div
        ref={modalRef}
        className={`
          ${styles.modal}
          ${styles[size]}
          ${className}
        `}
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-labelledby={title ? 'modal-title' : undefined}
        {...props}
      >
        <div className={styles.header}>
          {title && (
            <h2 id="modal-title" className={styles.title}>
              {title}
            </h2>
          )}
          
          {showCloseButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              ariaLabel="Fechar modal"
              className={styles.closeButton}
            >
              ✕
            </Button>
          )}
        </div>

        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

Modal.propTypes = {
  /** Controla a abertura do modal */
  isOpen: PropTypes.bool.isRequired,
  /** Função chamada ao fechar */
  onClose: PropTypes.func.isRequired,
  /** Título do modal */
  title: PropTypes.string,
  /** Conteúdo do modal */
  children: PropTypes.node.isRequired,
  /** Tamanho do modal */
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  /** Fechar ao clicar no overlay */
  closeOnOverlayClick: PropTypes.bool,
  /** Mostrar botão de fechar */
  showCloseButton: PropTypes.bool,
  /** Fechar com tecla ESC */
  closeOnEsc: PropTypes.bool,
  /** Classes CSS adicionais */
  className: PropTypes.string,
};

Modal.defaultProps = {
  title: '',
  size: 'md',
  closeOnOverlayClick: true,
  showCloseButton: true,
  closeOnEsc: true,
  className: '',
};

export default React.memo(Modal);