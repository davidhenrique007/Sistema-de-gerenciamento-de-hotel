// ============================================
// COMPONENT: ServiceCard
// ============================================
// Responsabilidade: Card individual de serviço
// Acessibilidade: role="checkbox", aria-checked, teclado
// ============================================

import React, { useCallback, memo } from 'react';
import styles from './ServicesSection.module.css';

// ============================================
// CONSTANTES
// ============================================

const TYPE_LABELS = {
  PER_NIGHT: 'por noite',
  PER_STAY: 'por estadia',
  PER_PERSON: 'por pessoa',
  PER_PERSON_NIGHT: 'por pessoa/noite'
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const ServiceCard = memo(({
  service,
  isSelected = false,
  onToggle,
  disabled = false,
  className = '',
  ...props
}) => {
  // ========================================
  // HANDLERS
  // ========================================
  
  const handleClick = useCallback(() => {
    if (!disabled) {
      onToggle(service.id, !isSelected);
    }
  }, [service.id, isSelected, onToggle, disabled]);

  const handleKeyDown = useCallback((e) => {
    // Tecla Enter ou Espaço ativam o toggle
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) {
        onToggle(service.id, !isSelected);
      }
    }
  }, [service.id, isSelected, onToggle, disabled]);

  // ========================================
  // CLASSES CSS
  // ========================================
  
  const cardClasses = [
    styles.serviceCard,
    isSelected && styles.selected,
    disabled && styles.disabled,
    className
  ].filter(Boolean).join(' ');

  // ========================================
  // RENDER
  // ========================================
  
  const typeLabel = TYPE_LABELS[service.type] || service.type;

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="checkbox"
      aria-checked={isSelected}
      aria-label={`${service.name} - ${service.description}`}
      tabIndex={disabled ? -1 : 0}
      {...props}
    >
      <div className={styles.serviceContent}>
        <div className={styles.serviceHeader}>
          <h3 className={styles.serviceName}>{service.name}</h3>
          <span className={styles.servicePrice}>
            {service.priceFormatted}
          </span>
        </div>
        
        <p className={styles.serviceDescription}>
          {service.description}
        </p>
        
        <div className={styles.serviceMeta}>
          <span className={styles.serviceType}>
            {typeLabel}
          </span>
          {service.maxQuantity > 0 && (
            <span className={styles.serviceQuantity}>
              Máx: {service.maxQuantity}
            </span>
          )}
        </div>
      </div>

      <div className={styles.serviceCheckbox}>
        <div className={`${styles.checkbox} ${isSelected ? styles.checked : ''}`}>
          {isSelected && <span className={styles.checkmark}>✓</span>}
        </div>
      </div>
    </div>
  );
});

ServiceCard.displayName = 'ServiceCard';