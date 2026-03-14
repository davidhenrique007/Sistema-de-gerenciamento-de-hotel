import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppRouter } from './router';
import { NotificationProvider } from './shared/components/ui/Notification/NotificationContext';
import { ClienteProvider } from './contexts/ClienteContext';  // ← ADICIONAR!

import './shared/styles/global.css';
import './shared/styles/variables.css';

document.documentElement.classList.add('light-theme');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NotificationProvider>
      <ClienteProvider>  {/* ← ENVOLVER COM ClienteProvider */}
        <AppRouter />
      </ClienteProvider>
    </NotificationProvider>
  </React.StrictMode>
);