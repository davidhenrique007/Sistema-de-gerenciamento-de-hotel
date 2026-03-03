import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// ============================================================================
// Lazy Loading das Páginas
// ============================================================================

const HomePage = React.lazy(() => import('@pages/Home/HomePage'));
const CheckoutPage = React.lazy(() => import('@pages/Checkout/CheckoutPage'));

// ============================================================================
// Loading Fallback
// ============================================================================

const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    Carregando...
  </div>
);

// ============================================================================
// Configuração das Rotas
// ============================================================================

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <HomePage />
      </React.Suspense>
    ),
  },
  {
    path: '/checkout',
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <CheckoutPage />
      </React.Suspense>
    ),
  },
  {
    path: '*',
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <HomePage />
      </React.Suspense>
    ),
  },
]);

// ============================================================================
// Provider das Rotas
// ============================================================================

export const AppRouter = () => <RouterProvider router={router} />;

export default router;