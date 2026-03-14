// =====================================================
// HOTEL PARADISE - VERIFICAÇÃO DE TIPO DE QUARTO
// Versão: 1.0.0
// =====================================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Middleware que verifica se um tipo de quarto foi selecionado
 * antes de permitir acesso a páginas de seleção de quartos
 */
const TipoQuartoRoute = ({ children, redirectTo = '/' }) => {
  const location = useLocation();
  
  // Verificar localStorage
  const tipoSelecionado = localStorage.getItem('@HotelParadise:tipoQuarto');
  
  // Se não houver tipo selecionado, redireciona para home
  if (!tipoSelecionado) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          from: location.pathname,
          message: 'Por favor, selecione um tipo de quarto primeiro'
        }} 
        replace 
      />
    );
  }

  // Se tiver tipo selecionado, renderiza o conteúdo
  return children;
};

export default TipoQuartoRoute;