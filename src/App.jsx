import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ✅ CORREÇÃO: Importação nomeada, não default
import { NotificationProvider, Notification } from './shared/components/ui/Notification';

const HomePage = React.lazy(() => import('./features/home/pages/HomePage'));
const CheckoutPage = React.lazy(() => import('./features/home/pages/CheckoutPage'));

const LoadingFallback = () => (
  <div>Carregando...</div>
);

function App() {
  return (
    <NotificationProvider maxStack={5} position="top-right">
      <BrowserRouter>
        <React.Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
      <Notification />
    </NotificationProvider>
  );
}

export default App;