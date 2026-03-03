import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@styles/global.css'; // Estilos globais

// ============================================================================
// CONFIGURAÇÕES INICIAIS
// ============================================================================

// Adiciona classe de tema claro (preparação para temas futuros)
document.documentElement.classList.add('light-theme');

// ============================================================================
// RENDER
// ============================================================================

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);