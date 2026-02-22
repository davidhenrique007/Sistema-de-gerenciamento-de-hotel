// ============================================
// COMPONENT: RoomStatusBadge
// ============================================
// Responsabilidade: Badge visual para status de ocupação do quarto
// Acessibilidade: ARIA labels para leitores de tela
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

const STATUS_CONFIG = {
  [RoomStatus.AVAILABLE]: {
    label: 'Disponível',
    icon: '✓',
    className: styles.available,
    ariaLabel: 'Quarto disponível para reserva'
  },
  [RoomStatus.OCCUPIED]: {
    label: 'Ocupado',
    icon: '✗',
    className: styles.occupied,
    ariaLabel: 'Quarto ocupado no momento'
  },
  [RoomStatus.MAINTENANCE]: {
    label: 'Manutenção',
    icon: '🔧',
    className: styles.maintenance,
    ariaLabel: 'Quarto em manutenção'
  },
  [RoomStatus.RESERVED]: {
    label: 'Reservado',
    icon: '📅',
    className: styles.reserved,
    ariaLabel: 'Quarto reservado'
  },
  [RoomStatus.CLEANING]: {
    label: 'Limpeza',
    icon: '🧹',
    className: styles.cleaning,
    ariaLabel: 'Quarto em limpeza'
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
  return (
    <RoomStatusBadge
      status={status}
      showIcon={true}
      showLabel={false}
      size="small"
      className={`${styles.compact} ${className}`}
      {...props}
    />
  );
};

RoomStatusBadgeCompact.displayName = 'RoomStatusBadgeCompact';