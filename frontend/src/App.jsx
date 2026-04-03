import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClienteProvider } from './contexts/ClienteContext';
import { CartProvider } from './contexts/CartContext';
import { ServicesProvider } from './contexts/ServicesContext';
import { ToastProvider } from './shared/components/contexts/ToastContext';
import ClienteRoute from './middlewares/ClienteRoute';
import HomePage from './features/home/pages/HomePage';
import LoginCliente from './features/home/pages/LoginCliente';
import Checkout from './features/home/pages/Checkout';
import ReciboPage from './features/home/pages/checkout/recibo/ReciboPage';
import PagamentoFalha from './features/home/pages/PagamentoFalha';
import MinhasReservas from './features/home/pages/cliente/MinhasReservas';

const App = () => {
  return (
    <ToastProvider>
      <BrowserRouter>
        <ClienteProvider>
          <CartProvider>
            <ServicesProvider>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login-cliente" element={<LoginCliente />} />
                <Route path="/checkout" element={
                  <ClienteRoute>
                    <Checkout />
                  </ClienteRoute>
                } />
                <Route path="/recibo" element={<ReciboPage />} />
                <Route path="/pagamento-falha" element={<PagamentoFalha />} />
                <Route path="/minhas-reservas" element={
                  <ClienteRoute>
                    <MinhasReservas />
                  </ClienteRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ServicesProvider>
          </CartProvider>
        </ClienteProvider>
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;