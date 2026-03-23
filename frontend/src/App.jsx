import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClienteProvider } from './contexts/ClienteContext';
import { CartProvider } from './contexts/CartContext';
import { ServicesProvider } from './contexts/ServicesContext';
import ClienteRoute from './middlewares/ClienteRoute';
import HomePage from './features/home/pages/HomePage';
import LoginCliente from './features/home/pages/LoginCliente';
import Checkout from './features/home/pages/Checkout';

const App = () => {
  return (
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ServicesProvider>
        </CartProvider>
      </ClienteProvider>
    </BrowserRouter>
  );
};

export default App;