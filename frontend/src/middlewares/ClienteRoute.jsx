import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCliente } from '../contexts/ClienteContext';
import { useI18n } from '../contexts/I18nContext';

const ClienteRoute = ({ children, redirectTo = '/login-cliente' }) => {
  const { isIdentificado, loading } = useCliente();
  const { t } = useI18n();
  const location = useLocation();

  console.log('🔒 ClienteRoute - Verificando acesso:');
  console.log('  - loading:', loading);
  console.log('  - isIdentificado:', isIdentificado);
  console.log('  - path:', location.pathname);

  // ✅ CRÍTICO: enquanto ClienteContext restaura sessão do localStorage,
  // NÃO redireciona — espera terminar o loading
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0f172a',
        color: '#fbbf24',
        fontSize: '18px',
        gap: '12px'
      }}>
        <span style={{ fontSize: '32px' }}>🏨</span>
        <span>{t('common.loading') || 'A carregar...'}</span>
      </div>
    );
  }

  // Só depois do loading terminar, decide redirecionar ou não
  if (!isIdentificado) {
    console.log('  🚫 Redirecionando para login. Origem:', location.pathname);
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
};

export default ClienteRoute;