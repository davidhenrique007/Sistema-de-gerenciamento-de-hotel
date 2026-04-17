// frontend/src/App.jsx
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
import Quartos from './features/home/pages/admin/Quartos';
import LixeiraQuartos from './features/home/pages/admin/LixeiraQuartos';
import Reservas from './features/home/pages/admin/Reservas';
import Utilizadores from './features/home/pages/admin/Utilizadores';
import Auditoria from './features/home/pages/admin/Auditoria';
import Relatorios from './features/home/pages/admin/Relatorios'; // ✅ NOVO IMPORT

// Placeholders para outras páginas admin
const PagamentosAdmin = () => (
  <div style={{ padding: 40 }}>Página de Pagamentos - Em desenvolvimento</div>
);

const ConfiguracoesAdmin = () => (
  <div style={{ padding: 40 }}>Página de Configurações - Em desenvolvimento</div>
);

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
                <Route
                  path="/checkout"
                  element={
                    <ClienteRoute>
                      <Checkout />
                    </ClienteRoute>
                  }
                />
                <Route path="/recibo" element={<ReciboPage />} />
                <Route
                  path="/minhas-reservas"
                  element={
                    <ClienteRoute>
                      <MinhasReservas />
                    </ClienteRoute>
                  }
                />

                {/* Rotas administrativas */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminRoute>
                      <Dashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/analises"
                  element={
                    <AdminRoute>
                      <DashboardAnalises />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/reservas"
                  element={
                    <AdminRoute>
                      <Reservas />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/pagamentos"
                  element={
                    <AdminRoute>
                      <PagamentosAdmin />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/quartos"
                  element={
                    <AdminRoute>
                      <Quartos />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/utilizadores"
                  element={
                    <AdminRoute>
                      <Utilizadores />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/auditoria"
                  element={
                    <AdminRoute>
                      <Auditoria />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/relatorios"  // ✅ NOVA ROTA
                  element={
                    <AdminRoute>
                      <Relatorios />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/configuracoes"
                  element={
                    <AdminRoute>
                      <ConfiguracoesAdmin />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/lixeira"
                  element={
                    <AdminRoute>
                      <LixeiraQuartos />
                    </AdminRoute>
                  }
                />

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