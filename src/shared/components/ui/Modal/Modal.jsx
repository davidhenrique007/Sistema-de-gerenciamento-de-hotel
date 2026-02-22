// ============================================
// COMPONENT: Modal
// ============================================
// Responsabilidade: Modal base reutilizável com acessibilidade
// Acessibilidade: role="dialog", aria-modal, trap de foco, tecla ESC
// ============================================

import React, { useEffect, useRef, useCallback } from 'react';
import { Button } from '../Button/Button.jsx';
import styles from './Modal.module.css';

// ============================================
// CONSTANTES
// ============================================

export const ModalSize = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  FULLSCREEN: 'fullscreen'
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const Modal = ({
  // Controle
  isOpen = false,
  onClose,
  
  // Conteúdo
  title,
  children,
  footer,
  
  // Ações
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  
  // Configuração
  size = ModalSize.MEDIUM,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  showConfirmButton = false,
  showCancelButton = true,
  
  // Estados dos botões
  confirmLoading = false,
  confirmDisabled = false,
  cancelDisabled = false,
  
  // Classes customizadas
  className = '',
  overlayClassName = '',
  contentClassName = '',
  
  // Props adicionais
  ...props
}) => {
  // ========================================
  // REFS
  // ========================================
  
  const modalRef = useRef(null);
  const contentRef = useRef(null);
  const initialFocusRef = useRef(null);
  const previousActiveElement = useRef(null);
  const closeButtonRef = useRef(null);
  const confirmButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);

  // ========================================
  // TRAP DE FOCO
  // ========================================
  
  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return [];
    
    const focusableSelectors = [
      'button',
      '[href]',
      'input',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])'
    ];
    
    return Array.from(
      modalRef.current.querySelectorAll(focusableSelectors.join(','))
    ).filter(el => !el.hasAttribute('disabled'));
  }, []);

  const trapFocus = useCallback((e) => {
    const focusableElements = getFocusableElements();
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, [getFocusableElements]);

  // ========================================
  // HANDLERS DE FECHAMENTO
  // ========================================
  
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const handleOverlayClick = useCallback((e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      handleClose();
    }
  }, [closeOnOverlayClick, handleClose]);

  const handleKeyDown = useCallback((e) => {
    if (closeOnEsc && e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      handleClose();
    }
    
    trapFocus(e);
  }, [closeOnEsc, handleClose, trapFocus]);

  // ========================================
  // HANDLERS DE AÇÕES
  // ========================================
  
  const handleConfirm = useCallback(() => {
    if (onConfirm && !confirmDisabled && !confirmLoading) {
      onConfirm();
    }
  }, [onConfirm, confirmDisabled, confirmLoading]);

  const handleCancel = useCallback(() => {
    if (onCancel && !cancelDisabled) {
      onCancel();
    } else {
      handleClose();
    }
  }, [onCancel, cancelDisabled, handleClose]);

  // ========================================
  // EFEITOS
  // ========================================
  
  useEffect(() => {
    if (isOpen) {
      // Salvar elemento ativo anterior
      previousActiveElement.current = document.activeElement;
      
      // Bloquear scroll do body
      document.body.style.overflow = 'hidden';
      
      // Adicionar event listener para ESC
      document.addEventListener('keydown', handleKeyDown);
      
      // Focar no modal
      setTimeout(() => {
        if (initialFocusRef.current) {
          initialFocusRef.current.focus();
        } else if (closeButtonRef.current) {
          closeButtonRef.current.focus();
        } else if (confirmButtonRef.current) {
          confirmButtonRef.current.focus();
        } else if (contentRef.current) {
          contentRef.current.focus();
        }
      }, 100);
    } else {
      // Restaurar scroll do body
      document.body.style.overflow = '';
      
      // Remover event listener
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restaurar foco anterior
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
    
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // ========================================
  // RENDER
  // ========================================
  
  if (!isOpen) return null;

  const modalClasses = [
    styles.modal,
    styles[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={`${styles.overlay} ${overlayClassName}`}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={modalClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby="modal-description"
        tabIndex={-1}
        {...props}
      >
        {/* Cabeçalho */}
        <div className={styles.header}>
          {title && (
            <h2 id="modal-title" className={styles.title}>
              {title}
            </h2>
          )}
          
          {showCloseButton && (
            <button
              ref={closeButtonRef}
              className={styles.closeButton}
              onClick={handleClose}
              aria-label="Fechar modal"
              type="button"
            >
              <span aria-hidden="true">×</span>
            </button>
          )}
        </div>

        {/* Conteúdo */}
        <div
          ref={contentRef}
          id="modal-description"
          className={`${styles.content} ${contentClassName}`}
          tabIndex={-1}
        >
          {children}
        </div>

        {/* Footer */}
        {(footer || showCancelButton || showConfirmButton) && (
          <div className={styles.footer}>
            {footer || (
              <>
                {showCancelButton && (
                  <Button
                    ref={cancelButtonRef}
                    variant="ghost"
                    onClick={handleCancel}
                    disabled={cancelDisabled}
                    aria-label={cancelText}
                  >
                    {cancelText}
                  </Button>
                )}
                
                {showConfirmButton && (
                  <Button
                    ref={confirmButtonRef}
                    variant="primary"
                    onClick={handleConfirm}
                    loading={confirmLoading}
                    disabled={confirmDisabled}
                    aria-label={confirmText}
                  >
                    {confirmText}
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

Modal.displayName = 'Modal';

// ============================================
// HOOK PARA USAR MODAL
// ============================================

export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle
  };
};