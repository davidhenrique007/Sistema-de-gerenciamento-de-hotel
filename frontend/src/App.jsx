// =====================================================
// HOTEL PARADISE - APP PRINCIPAL (ATUALIZADO)
// Versão: 1.2.0
// =====================================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClienteProvider } from './contexts/ClienteContext';
import { CartProvider } from './contexts/CartContext';
import ClienteRoute from './middlewares/ClienteRoute';
import TipoQuartoRoute from './middlewares/TipoQuartoRoute';

// Páginas
import HomePage from './features/home/pages/HomePage';
import LoginCliente from './pages/LoginCliente';
import QuartosDisponiveis from './pages/QuartosDisponiveis';
import QuartoDetalhe from './pages/QuartoDetalhe';
import CheckoutPage from './pages/CheckoutPage';
import ReciboPage from './pages/ReciboPage';
import PerfilCliente from './pages/PerfilCliente';

// Layout
import Layout from './components/layout/Layout';

const App = () => {
  return (
    <BrowserRouter>
      <ClienteProvider>
        <CartProvider>
          <Layout>
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login-cliente" element={<LoginCliente />} />
              
              {/* Rotas que precisam de tipo de quarto selecionado */}
              <Route 
                path="/quartos/disponiveis" 
                element={
                  <TipoQuartoRoute>
                    <QuartosDisponiveis />
                  </TipoQuartoRoute>
                } 
              />
              
              <Route 
                path="/quartos/:id" 
                element={
                  <TipoQuartoRoute>
                    <QuartoDetalhe />
                  </TipoQuartoRoute>
                } 
              />
              
              {/* Rotas Protegidas (precisa estar logado) */}
              <Route 
                path="/checkout" 
                element={
                  <ClienteRoute>
                    <CheckoutPage />
                  </ClienteRoute>
                } 
              />
              
              <Route 
                path="/recibo/:id" 
                element={
                  <ClienteRoute>
                    <ReciboPage />
                  </ClienteRoute>
                } 
              />
              
              <Route 
                path="/perfil" 
                element={
                  <ClienteRoute>
                    <PerfilCliente />
                  </ClienteRoute>
                } 
              />
              
              {/* Rota de fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </CartProvider>
      </ClienteProvider>
    </BrowserRouter>
  );
};

export default App;
