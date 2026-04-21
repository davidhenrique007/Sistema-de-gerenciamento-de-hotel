import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCliente } from '@hooks/useCliente';

const ClienteRoute = ({ children, redirectTo = '/login-cliente' }) => {
  const { isIdentificado, loading, cliente } = useCliente();
  const location = useLocation();

  console.log('🔒🔒🔒 ClienteRoute EXECUTANDO 🔒🔒🔒');
  console.log('  - loading:', loading);
  console.log('  - isIdentificado:', isIdentificado);
  console.log('  - path:', location.pathname);

  if (loading) {
    console.log('  ⏳ Loading...');
    return <div>Carregando...</div>;
  }

  if (!isIdentificado) {
    console.log('  🚫 Redirecionando para:', redirectTo);
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  console.log('  ✅ Acesso permitido');
  return children;
};

export default ClienteRoute;
