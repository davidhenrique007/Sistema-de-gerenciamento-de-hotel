// ============================================
// COMPONENT: RoomStatusBadge
// ============================================
// Responsabilidade: Badge visual para status de ocupação do quarto
// VERSÃO CORRIGIDA - Design corporativo consistente
// ============================================

import React from 'react';
import styles from './RoomStatusBadge.module.css';

// ============================================
// CONSTANTES
// ============================================

export const RoomStatus = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
  RESERVED: 'reserved',
  CLEANING: 'cleaning'
};

// Configuração completa dos status com cores corporativas
const STATUS_CONFIG = {
  [RoomStatus.AVAILABLE]: {
    label: 'Disponível',
    icon: '✓',
    iconName: 'check',
    className: styles.available,
    ariaLabel: 'Quarto disponível para reserva imediata',
    description: 'Quarto livre e pronto para reserva'
  },
  [RoomStatus.OCCUPIED]: {
    label: 'Ocupado',
    icon: '●',
    iconName: 'circle',
    className: styles.occupied,
    ariaLabel: 'Quarto ocupado no momento com hóspedes',
    description: 'Quarto atualmente ocupado'
  },
  [RoomStatus.MAINTENANCE]: {
    label: 'Manutenção',
    icon: '🔧',
    iconName: 'wrench',
    className: styles.maintenance,
    ariaLabel: 'Quarto em manutenção temporária',
    description: 'Quarto indisponível para reservas'
  },
  [RoomStatus.RESERVED]: {
    label: 'Reservado',
    icon: '📅',
    iconName: 'calendar',
    className: styles.reserved,
    ariaLabel: 'Quarto reservado para data futura',
    description: 'Quarto com reserva confirmada'
  },
  [RoomStatus.CLEANING]: {
    label: 'Limpeza',
    icon: '🧹',
    iconName: 'broom',
    className: styles.cleaning,
    ariaLabel: 'Quarto em processo de limpeza',
    description: 'Quarto sendo preparado'
  }
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const RoomStatusBadge = ({
  status = RoomStatus.AVAILABLE,
  showIcon = true,
  showLabel = true,
  size = 'medium', // 'small', 'medium', 'large'
  className = '',
  ...props
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG[RoomStatus.AVAILABLE];
  
  const badgeClasses = [
    styles.badge,
    config.className,
    styles[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={badgeClasses}
      role="status"
      aria-label={config.ariaLabel}
      title={config.description}
      {...props}
    >
      {showIcon && (
        <span className={styles.icon} aria-hidden="true">
          {config.icon}
        </span>
      )}
      {showLabel && (
        <span className={styles.label}>
          {config.label}
        </span>
      )}
    </div>
  );
};

RoomStatusBadge.displayName = 'RoomStatusBadge';

// ============================================
// COMPONENTE: RoomStatusBadgeCompact
// ============================================
// Versão compacta (apenas ícone) para cards pequenos
// ============================================

export const RoomStatusBadgeCompact = ({
  status = RoomStatus.AVAILABLE,
  className = '',
  ...props
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG[RoomStatus.AVAILABLE];
  
  return (
    <div
      className={`${styles.compact} ${config.className} ${className}`}
      role="status"
      aria-label={config.ariaLabel}
      title={config.description}
      {...props}
    >
      <span className={styles.compactIcon} aria-hidden="true">
        {config.icon}
      </span>
    </div>
  );
};

RoomStatusBadgeCompact.displayName = 'RoomStatusBadgeCompact';

// ============================================
// COMPONENTE: RoomStatusPill
// ============================================
// Versão em formato de pílula (apenas texto) para listas
// ============================================

export const RoomStatusPill = ({
  status = RoomStatus.AVAILABLE,
  className = '',
  ...props
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG[RoomStatus.AVAILABLE];
  
  return (
    <span
      className={`${styles.pill} ${config.className} ${className}`}
      role="status"
      aria-label={config.ariaLabel}
      {...props}
    >
      {config.label}
    </span>
  );
};

RoomStatusPill.displayName = 'RoomStatusPill';