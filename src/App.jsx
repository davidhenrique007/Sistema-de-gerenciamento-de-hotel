import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DIContainerProvider } from './di/providers.jsx';
import { NotificationProvider } from './shared/components/ui/Notification/Notification.jsx';
import { HomeProvider } from './di/homeDependencies.jsx'; // <-- IMPORTAÇÃO ADICIONADA
import { HomePage } from './features/home/pages/HomePage.jsx';
import './shared/styles/global.css';

function App() {
  return (
    <BrowserRouter>
      <DIContainerProvider>
        <NotificationProvider>
          <HomeProvider> {/* <-- PROVIDER ADICIONADO ENVOLVENDO A ROTA */}
            <Routes>
              <Route path="/" element={<HomePage />} />
              {/* Adicione outras rotas aqui se necessário */}
            </Routes>
          </HomeProvider>
        </NotificationProvider>
      </DIContainerProvider>
    </BrowserRouter>
  );
}

export default App;