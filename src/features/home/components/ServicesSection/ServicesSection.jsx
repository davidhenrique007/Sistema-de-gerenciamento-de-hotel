// ============================================
// COMPONENT: ServicesSection
// ============================================
// Responsabilidade: Seção de listagem de serviços adicionais
// Acessibilidade: role="group", navegação por teclado
// ============================================

import React, { useState, useCallback, useMemo, memo } from 'react';
import { ServiceCard } from './ServiceCard.js';
import styles from './ServicesSection.module.css';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const ServicesSection = memo(({
  services = [],
  selectedServiceIds = [],
  onServiceToggle,
  maxSelections = 10,
  title = 'Serviços Adicionais',
  subtitle = 'Personalize sua estadia com nossos serviços exclusivos',
  isLoading = false,
  disabled = false,
  className = '',
  ...props
}) => {
  // ========================================
  // ESTADOS
  // ========================================
  
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // ========================================
  // HANDLERS
  // ========================================
  
  const handleToggle = useCallback((serviceId, isSelected) => {
    if (disabled) return;

    // Verificar limite máximo de seleções
    if (isSelected && selectedServiceIds.length >= maxSelections) {
      // Pode emitir um aviso ou notificação
      console.warn(`Máximo de ${maxSelections} serviços selecionados`);
      return;
    }

    onServiceToggle(serviceId, isSelected);
  }, [selectedServiceIds.length, maxSelections, onServiceToggle, disabled]);

  const handleKeyDown = useCallback((e) => {
    // Navegação por teclado entre os cards
    const cards = document.querySelectorAll(`.${styles.serviceCard}`);
    
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < services.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : services.length - 1
        );
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(services.length - 1);
        break;
    }
  }, [services.length]);

  // Focar no card apropriado quando o índice muda
  React.useEffect(() => {
    if (focusedIndex >= 0) {
      const cards = document.querySelectorAll(`.${styles.serviceCard}`);
      if (cards[focusedIndex]) {
        cards[focusedIndex].focus();
      }
    }
  }, [focusedIndex]);

  // ========================================
  // MEMOIZAÇÃO
  // ========================================
  
  const groupedServices = useMemo(() => {
    const groups = {};
    
    services.forEach(service => {
      const type = service.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(service);
    });

    return groups;
  }, [services]);

  // ========================================
  // RENDER
  // ========================================
  
  const selectedCount = selectedServiceIds.length;
  const canSelectMore = selectedCount < maxSelections;

  return (
    <section 
      className={`${styles.section} ${className}`}
      aria-labelledby="services-title"
      onKeyDown={handleKeyDown}
      {...props}
    >
      <div className={styles.header}>
        <h2 id="services-title" className={styles.title}>
          {title}
        </h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        
        <div className={styles.selectionInfo} aria-live="polite">
          <span className={styles.selectedCount}>
            {selectedCount} de {maxSelections} serviços selecionados
          </span>
          {!canSelectMore && (
            <span className={styles.warning}>
              Limite máximo atingido
            </span>
          )}
        </div>
      </div>

      <div 
        className={styles.grid}
        role="group"
        aria-label="Lista de serviços disponíveis"
      >
        {services.map((service, index) => (
          <ServiceCard
            key={service.id}
            service={service}
            isSelected={selectedServiceIds.includes(service.id)}
            onToggle={handleToggle}
            disabled={disabled || (!canSelectMore && !selectedServiceIds.includes(service.id))}
            tabIndex={focusedIndex === index ? 0 : -1}
          />
        ))}
      </div>

      {isLoading && (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          <span>Carregando serviços...</span>
        </div>
      )}

      {!isLoading && services.length === 0 && (
        <div className={styles.empty}>
          <p>Nenhum serviço disponível no momento.</p>
        </div>
      )}
    </section>
  );
});

ServicesSection.displayName = 'ServicesSection';