import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente base para todos os ícones do sistema
 * 
 * @param {Object} props
 * @param {string} props.size - Tamanho do ícone (sm, md, lg, xl)
 * @param {string} props.color - Cor do ícone (usar variáveis CSS)
 * @param {string} props.className - Classes CSS adicionais
 */
const Icon = ({ 
  children, 
  size = 'md', 
  color = 'currentColor',
  className = '',
  viewBox = '0 0 24 24',
  ...props 
}) => {
  // Mapeamento de tamanhos
  const sizeMap = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
    '2xl': 64,
  };

  const iconSize = sizeMap[size] || 24;

  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox={viewBox}
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {children}
    </svg>
  );
};

Icon.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  color: PropTypes.string,
  className: PropTypes.string,
  viewBox: PropTypes.string,
};

export default Icon;