import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  const adminUser = localStorage.getItem('admin_user');

  console.log('🔐 [AdminRoute] Verificando autenticação:');
  console.log('   token:', token ? `${token.substring(0, 30)}...` : 'NÃO ENCONTRADO');
  console.log('   adminUser:', adminUser ? 'ENCONTRADO' : 'NÃO ENCONTRADO');

  if (!token || !adminUser) {
    console.log('❌ [AdminRoute] Token ou usuário não encontrado, redirecionando para /login-admin');
    return <Navigate to="/login-admin" replace />;
  }

  try {
    const user = JSON.parse(adminUser);
    console.log('   user.role:', user.role);
    
    if (!['admin', 'receptionist', 'financial'].includes(user.role)) {
      console.log('❌ [AdminRoute] Role não permitida:', user.role);
      return <Navigate to="/login-admin" replace />;
    }
    
    console.log('✅ [AdminRoute] Acesso permitido para:', user.role);
  } catch (error) {
    console.error('❌ [AdminRoute] Erro ao parsear user:', error);
    return <Navigate to="/login-admin" replace />;
  }

  return children;
};

export default AdminRoute;
