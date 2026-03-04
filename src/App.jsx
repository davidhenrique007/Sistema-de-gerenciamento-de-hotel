import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ============================================================================
// PROVIDERS GLOBAIS
// ============================================================================

import { NotificationProvider } from './shared/components/Notification';

// ============================================================================
// COMPONENTES GLOBAIS
// ============================================================================

import Notification from './shared/components/Notification';

// ============================================================================
// PAGES (Lazy Loading)
// ============================================================================

const HomePage = React.lazy(() => import('./pages/Home/HomePage'));
const CheckoutPage = React.lazy(() => import('./pages/Checkout/CheckoutPage'));

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
      <div className="spinner" style={{
        width: '40px',
        height: '40px',
        border: '3px solid var(--color-neutral-200)',
        borderTopColor: 'var(--color-primary-600)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto var(--spacing-4)'
      }} />
      <p style={{ color: 'var(--color-text-secondary)' }}>Carregando Hotel Paradise...</p>
    </div>
  </div>
);

/**
 * App - Componente raiz com providers globais
 */
function App() {
  return (
    <NotificationProvider maxStack={5} position="top-right">
      <BrowserRouter>
        <React.Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
      <Notification />
    </NotificationProvider>
  );
}

export default App;