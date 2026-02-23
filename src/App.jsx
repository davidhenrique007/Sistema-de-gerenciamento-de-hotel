import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DIContainerProvider } from './di/providers.jsx';
import { NotificationProvider } from './shared/components/ui/Notification/Notification.jsx';
import { HomeProvider } from './di/homeDependencies.jsx';
import { HomePage } from './features/home/pages/HomePage.jsx';
import { CheckoutPage } from './pages/checkout/CheckoutPage.jsx';
import './shared/styles/global.css';

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <DIContainerProvider>
        <NotificationProvider>
          <HomeProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              {/* Rotas futuras */}
              <Route path="/quartos" element={<div>Página de Quartos (em construção)</div>} />
              <Route path="/servicos" element={<div>Página de Serviços (em construção)</div>} />
              <Route path="/contato" element={<div>Página de Contato (em construção)</div>} />
            </Routes>
          </HomeProvider>
        </NotificationProvider>
      </DIContainerProvider>
    </BrowserRouter>
  );
}

export default App;