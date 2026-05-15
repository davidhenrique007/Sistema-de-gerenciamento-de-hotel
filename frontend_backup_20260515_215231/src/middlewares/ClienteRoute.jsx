// frontend/src/middlewares/ClienteRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCliente } from '../contexts/ClienteContext';
import { useI18n } from '../contexts/I18nContext';

const ClienteRoute = ({ children, redirectTo = '/login-cliente' }) => {
  const { isIdentificado, loading, cliente } = useCliente();
  const { t } = useI18n(); // Consumindo i18n para mensagens traduzidas
  const location = useLocation();

  // Mensagens traduzidas para debug/log (opcional)
  console.log('🔒🔒🔒 ' + t('common.loading') + ' 🔒🔒🔒');
  console.log('  - loading:', loading);
  console.log('  - isIdentificado:', isIdentificado);
  console.log('  - path:', location.pathname);

  if (loading) {
    console.log('  ⏳ ' + t('common.loading'));
    // Mensagem de loading traduzida
    return <div>{t('common.loading')}</div>;
  }

  if (!isIdentificado) {
    console.log('  🚫 ' + t('errors.access_denied') + ' ' + redirectTo);
    // Redirecionamento com mensagem traduzida (opcional via toast/notification)
    return <Navigate to={redirectTo} state={{ 
      from: location.pathname,
      message: t('errors.session_expired')
    }} replace />;
  }

  console.log('  ✅ ' + t('common.success'));
  return children;
};

export default ClienteRoute;