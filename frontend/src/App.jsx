import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClienteProvider } from './contexts/ClienteContext';
import { CartProvider } from './contexts/CartContext';
import { ServicesProvider } from './contexts/ServicesContext';
import { ToastProvider } from './shared/components/contexts/ToastContext';
import ClienteRoute from './middlewares/ClienteRoute';
import AdminRoute from './middlewares/AdminRoute';
import HomePage from './features/home/pages/HomePage';
import LoginCliente from './features/home/pages/LoginCliente';
import LoginAdmin from './features/home/pages/admin/LoginAdmin/LoginAdmin';
import Checkout from './features/home/pages/checkout/index';
import ReciboPage from './features/home/pages/checkout/recibo/ReciboPage';
import PagamentoFalha from './features/home/pages/PagamentoFalha';
import MinhasReservas from './features/home/pages/cliente/MinhasReservas';
import Dashboard from './features/home/pages/admin/Dashboard';
import DashboardAnalises from './features/home/pages/admin/DashboardAnalises';

// Placeholders para outras páginas admin
const ReservasAdmin = () => <div style={{ padding: 40 }}>Página de Reservas - Em desenvolvimento</div>;
const PagamentosAdmin = () => <div style={{ padding: 40 }}>Página de Pagamentos - Em desenvolvimento</div>;
const QuartosAdmin = () => <div style={{ padding: 40 }}>Página de Quartos - Em desenvolvimento</div>;
const ConfiguracoesAdmin = () => <div style={{ padding: 40 }}>Página de Configurações - Em desenvolvimento</div>;

const App = () => {
  return (
    <ToastProvider>
      <BrowserRouter>
        <ClienteProvider>
          <CartProvider>
            <ServicesProvider>
              <Routes>
                {/* Rotas públicas */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login-cliente" element={<LoginCliente />} />
                <Route path="/login-admin" element={<LoginAdmin />} />
                <Route path="/pagamento-falha" element={<PagamentoFalha />} />
                
                {/* Rotas de cliente */}
                <Route path="/checkout" element={
                  <ClienteRoute>
                    <Checkout />
                  </ClienteRoute>
                } />
                <Route path="/recibo" element={<ReciboPage />} />
                <Route path="/minhas-reservas" element={
                  <ClienteRoute>
                    <MinhasReservas />
                  </ClienteRoute>
                } />
                
                {/* Rotas administrativas */}
                <Route path="/admin/dashboard" element={
                  <AdminRoute>
                    <Dashboard />
                  </AdminRoute>
                } />
                <Route path="/admin/analises" element={
                  <AdminRoute>
                    <DashboardAnalises />
                  </AdminRoute>
                } />
                <Route path="/admin/reservas" element={
                  <AdminRoute>
                    <ReservasAdmin />
                  </AdminRoute>
                } />
                <Route path="/admin/pagamentos" element={
                  <AdminRoute>
                    <PagamentosAdmin />
                  </AdminRoute>
                } />
                <Route path="/admin/quartos" element={
                  <AdminRoute>
                    <QuartosAdmin />
                  </AdminRoute>
                } />
                <Route path="/admin/configuracoes" element={
                  <AdminRoute>
                    <ConfiguracoesAdmin />
                  </AdminRoute>
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