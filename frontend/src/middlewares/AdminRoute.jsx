import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  const adminUser = localStorage.getItem('admin_user');
  
  if (!token || !adminUser) {
    return <Navigate to="/login-admin" replace />;
  }
  
  try {
    const user = JSON.parse(adminUser);
    if (!['admin', 'receptionist', 'financial'].includes(user.role)) {
      return <Navigate to="/login-admin" replace />;
    }
  } catch (error) {
    return <Navigate to="/login-admin" replace />;
  }
  
  return children;
};

export default AdminRoute;
