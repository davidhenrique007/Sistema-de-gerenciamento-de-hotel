import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { NotificationProvider } from './shared/components/ui/Notification/NotificationContext';
import './shared/styles/global.css';
import './shared/styles/variables.css';

document.documentElement.classList.add('light-theme');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </React.StrictMode>
);