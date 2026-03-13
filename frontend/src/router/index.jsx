import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Spinner from '../shared/components/ui/Spinner';

// ============================================================================
// LAZY LOADING DAS PÁGINAS
// ============================================================================

const HomePage = React.lazy(() => import('../features/home/pages/HomePage'));
const CheckoutPage = React.lazy(() => import('../features/home/pages/CheckoutPage'));
const LoginCliente = React.lazy(() => import('../features/home/pages/LoginCliente')); // ← NOVA LINHA!

// ============================================================================
// COMPONENTE DE FALLBACK PROFISSIONAL
// ============================================================================

const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    backgroundColor: 'var(--color-bg-primary)'
  }}>
    <Spinner size="lg" />
  </div>
);

// ============================================================================
// CONFIGURAÇÃO DAS ROTAS
// ============================================================================

const withSuspense = (Component) => (
  <React.Suspense fallback={<LoadingFallback />}>
    <Component />
  </React.Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: withSuspense(HomePage),
    errorElement: <div>Erro ao carregar página</div>,
  },
  {
    path: '/checkout',
    element: withSuspense(CheckoutPage),
  },
  {
    path: '/login-cliente',  // ← NOVA ROTA ADICIONADA!
    element: withSuspense(LoginCliente),
  },
  {
    path: '*',
    element: withSuspense(HomePage),
  },
]);

// ============================================================================
// PROVIDER DAS ROTAS
// ============================================================================

export const AppRouter = () => <RouterProvider router={router} />;

export default router;