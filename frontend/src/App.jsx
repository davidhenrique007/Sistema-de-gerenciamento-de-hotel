import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HotelSplash from './shared/components/ui/Splash';
import { NotificationProvider, Notification } from './shared/components/ui/Notification'; // ← CORRIGIDO

// Páginas
const HomePage = React.lazy(() => import('./features/home/pages/HomePage'));
const CheckoutPage = React.lazy(() => import('./features/home/pages/CheckoutPage'));

const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    background: '#f8fafc'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div className="spinner" />
      <p style={{ marginTop: '20px', color: '#64748b' }}>Carregando...</p>
    </div>
  </div>
);

function App() {
  return (
    <>
      <HotelSplash />
      
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
    </>
  );
}

export default App;