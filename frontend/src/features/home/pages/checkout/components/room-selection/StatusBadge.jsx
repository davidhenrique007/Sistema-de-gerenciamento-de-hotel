// =====================================================
// COMPONENTE - STATUS BADGE
// Versão: 2.0.0 (Com suporte a i18n - CORRIGIDO)
// =====================================================

import React from 'react';

const StatusBadge = ({ status, t }) => {
  // Função segura para obter tradução
  const getStatusText = (statusKey, defaultValue) => {
    const result = t(`rooms.${statusKey}`);
    if (typeof result === 'string') return result;
    return defaultValue;
  };

  const getBadgeConfig = () => {
    switch (status) {
      case 'disponível':
      case 'available':
        return { 
          emoji: '🟢', 
          text: getStatusText('available', 'Disponível'),
          bgColor: '#d4edda',
          textColor: '#155724'
        };
      case 'ocupado':
      case 'occupied':
        return { 
          emoji: '🔴', 
          text: getStatusText('occupied', 'Ocupado'),
          bgColor: '#f8d7da',
          textColor: '#721c24'
        };
      case 'manutenção':
      case 'maintenance':
        return { 
          emoji: '🟡', 
          text: getStatusText('maintenance', 'Manutenção'),
          bgColor: '#fff3cd',
          textColor: '#856404'
        };
      default:
        return { 
          emoji: '⚪', 
          text: status || getStatusText('unknown', 'Desconhecido'),
          bgColor: '#e9ecef',
          textColor: '#495057'
        };
    }
  };

  const config = getBadgeConfig();

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '500',
    backgroundColor: config.bgColor,
    color: config.textColor,
    width: 'fit-content'
  };

  return (
    <span style={badgeStyle}>
      <span style={{ fontSize: '1rem' }}>{config.emoji}</span>
      <span>{config.text}</span>
    </span>
  );
};

export default StatusBadge;