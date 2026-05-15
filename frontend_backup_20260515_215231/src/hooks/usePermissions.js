import { useAuth } from '../contexts/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();

  const userRole = user?.role || 'receptionist';

  const rolePermissions = {
    admin: ['all'],
    receptionist: ['reservations', 'rooms', 'checkin', 'checkout'],
    financial: ['reports', 'payments', 'invoices']
  };

  const hasRole = (role) => {
    if (userRole === 'admin') return true;
    return userRole === role;
  };

  const hasPermission = (permission) => {
    if (userRole === 'admin') return true;
    const permissions = rolePermissions[userRole] || [];
    return permissions.includes(permission);
  };

  const canAccess = (module) => {
    return hasPermission(module);
  };

  const getUserRole = () => userRole;

  return {
    hasRole,
    hasPermission,
    canAccess,
    getUserRole,
    isAdmin: userRole === 'admin',
    isReceptionist: userRole === 'receptionist',
    isFinancial: userRole === 'financial'
  };
};

export default usePermissions;