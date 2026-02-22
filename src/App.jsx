import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DIContainerProvider } from './di/providers.jsx';
import { HomePage } from './features/home/pages/HomePage.jsx';  // ← Mudou para .jsx
import './shared/styles/global.css';

function App() {
  return (
    <BrowserRouter>
      <DIContainerProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </DIContainerProvider>
    </BrowserRouter>
  );
}

export default App;