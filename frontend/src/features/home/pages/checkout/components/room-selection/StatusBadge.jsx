import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'disponível':
      case 'available':
        return { 
          emoji: '🟢', 
          text: 'Disponível', 
          className: 'badge-disponivel',
          bgColor: '#d4edda',
          textColor: '#155724'
        };
      case 'ocupado':
      case 'occupied':
        return { 
          emoji: '🔴', 
          text: 'Ocupado', 
          className: 'badge-ocupado',
          bgColor: '#f8d7da',
          textColor: '#721c24'
        };
      case 'manutenção':
      case 'maintenance':
        return { 
          emoji: '🟡', 
          text: 'Manutenção', 
          className: 'badge-manutencao',
          bgColor: '#fff3cd',
          textColor: '#856404'
        };
      default:
        return { 
          emoji: '⚪', 
          text: status, 
          className: '',
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
    <span style={badgeStyle} className={config.className}>
      <span style={{ fontSize: '1rem' }}>{config.emoji}</span>
      <span>{config.text}</span>
    </span>
  );
};

export default StatusBadge;