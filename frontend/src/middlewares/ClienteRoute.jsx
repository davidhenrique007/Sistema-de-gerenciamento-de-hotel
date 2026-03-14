// =====================================================
// HOTEL PARADISE - ROTA PROTEGIDA PARA CLIENTE
// Versão: 1.0.0
// =====================================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCliente } from '../hooks/useCliente';

/**
 * Componente de rota protegida para clientes
 * Verifica se o cliente está identificado antes de permitir acesso
 */
const ClienteRoute = ({ children, redirectTo = '/login-cliente' }) => {
  const { isIdentificado, loading } = useCliente();
  const location = useLocation();

  // Mostrar loading enquanto verifica sessão
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div className="spinner" />
      </div>
    );
  }

  // Se não estiver identificado, redireciona para login
  if (!isIdentificado) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          from: location.pathname,
          message: 'Por favor, identifique-se para acessar esta página'
        }} 
        replace 
      />
    );
  }

  // Se estiver identificado, renderiza o conteúdo
  return children;
};

export default ClienteRoute;