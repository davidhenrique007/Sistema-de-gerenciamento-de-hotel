// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider } from './contexts/I18nContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { WidgetProvider } from './contexts/WidgetContext';
import { AuthProvider } from './contexts/AuthContext';
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
import Relatorios from './features/home/pages/admin/Relatorios';
import Financeiro from './features/home/pages/admin/Financeiro';
import Configuracoes from './features/home/pages/admin/components/configuracoes/Configuracoes';

const PagamentosAdmin = () => (
  <div style={{ padding: 40 }}>Página de Pagamentos - Em desenvolvimento</div>
);

const App = () => {
  return (
    <BrowserRouter>
      <I18nProvider>
        <ThemeProvider>
          <CurrencyProvider>
            <NotificationProvider>
              <WidgetProvider>
                <ToastProvider>
                  <AuthProvider>
                    <ClienteProvider>
                      <CartProvider>
                        <ServicesProvider>
                          <Routes>
                            {/* Rotas públicas */}
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login-cliente" element={<LoginCliente />} />
                            <Route path="/login-admin" element={<LoginAdmin />} />
                            <Route path="/pagamento-falha" element={<PagamentoFalha />} />

                            {/* Rotas de cliente (protegidas) */}
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

                            {/* Rotas administrativas (protegidas) */}
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
                              path="/admin/financeiro"
                              element={
                                <AdminRoute>
                                  <Financeiro />
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
                              path="/admin/relatorios"
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
                                  <Configuracoes />
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

                            {/* Rota padrão para 404 */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                          </Routes>
                        </ServicesProvider>
                      </CartProvider>
                    </ClienteProvider>
                  </AuthProvider>
                </ToastProvider>
              </WidgetProvider>
            </NotificationProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </I18nProvider>
    </BrowserRouter>
  );
};

export default App;

