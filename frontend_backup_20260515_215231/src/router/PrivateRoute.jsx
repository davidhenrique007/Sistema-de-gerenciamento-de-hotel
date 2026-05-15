// =====================================================
// HOTEL PARADISE - ROTA PRIVADA
// Versão: 1.0.0
// =====================================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, hasPermission, loading } = useAuth();

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

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (allowedRoles.length > 0 && !hasPermission(allowedRoles)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return children;
};

export default PrivateRoute;