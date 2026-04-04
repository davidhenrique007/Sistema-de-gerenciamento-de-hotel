import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  // Verificar se o usuário está logado como admin
  const adminToken = localStorage.getItem('admin_token');
  const adminUser = localStorage.getItem('admin_user');
  
  if (!adminToken || !adminUser) {
    // Redirecionar para login do admin
    return <Navigate to="/login-admin" replace />;
  }
  
  try {
    const user = JSON.parse(adminUser);
    // Verificar se o usuário tem role de admin, recepcionista ou financeiro
    if (!['admin', 'receptionist', 'financial'].includes(user.role)) {
      return <Navigate to="/login-admin" replace />;
    }
  } catch (error) {
    return <Navigate to="/login-admin" replace />;
  }
  
  return children;
};

export default AdminRoute;
