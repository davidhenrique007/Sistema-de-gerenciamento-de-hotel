// =====================================================
// HOTEL PARADISE - ROTA PROTEGIDA PARA CLIENTE
// Versão: 1.0.0
// =====================================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCliente } from '../hooks/useCliente';

const ClienteRoute = ({ children, redirectTo = '/login-cliente' }) => {
  const { isIdentificado, loading, cliente } = useCliente();
  const location = useLocation();

  console.log('========== DEBUG ClienteRoute ==========');
  console.log('📍 Path atual:', location.pathname);
  console.log('👤 isIdentificado:', isIdentificado);
  console.log('⏳ loading:', loading);
  console.log('📦 cliente:', cliente);
  console.log('========================================');

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

  return children;
};

export default ClienteRoute;