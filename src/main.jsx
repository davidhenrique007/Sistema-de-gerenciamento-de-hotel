import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ✅ CORREÇÃO: Usar caminho relativo, não alias
import './shared/styles/global.css';
import './shared/styles/variables.css';

document.documentElement.classList.add('light-theme');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);