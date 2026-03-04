import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ============================================================================
// PROVIDERS GLOBAIS
// ============================================================================

import { NotificationProvider } from './shared/components/ui/Notification';

// ============================================================================
// COMPONENTES GLOBAIS
// ============================================================================

import Notification from './shared/components/ui/Notification';
import Spinner from './shared/components/ui/Spinner';

// ============================================================================
// PAGES (LAZY LOADING)
// ============================================================================

const HomePage = React.lazy(() => import('./features/home/pages/HomePage'));
const CheckoutPage = React.lazy(() => import('./features/home/pages/CheckoutPage'));

// ============================================================================
// LOADING FALLBACK
// ============================================================================

const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    backgroundColor: 'var(--color-bg-primary)'
  }}>
    <div style={{ textAlign: 'center' }}>
      <Spinner size="lg" />
      <p style={{ 
        marginTop: 'var(--spacing-4)',
        color: 'var(--color-text-secondary)',
        fontSize: 'var(--font-size-lg)'
      }}>
        Carregando Hotel Paradise...
      </p>
    </div>
  </div>
);

/**
 * App - Componente raiz com todos os providers
 * 
 * Configuração final para produção:
 * - NotificationProvider para feedback global
 * - React Router com lazy loading
 * - Suspense com fallback profissional
 */
function App() {
  return (
    <NotificationProvider 
      maxStack={5} 
      position="top-right"
    >
      <BrowserRouter>
        <React.Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
      
      {/* Componente global de notificações */}
      <Notification />
    </NotificationProvider>
  );
}

export default App;