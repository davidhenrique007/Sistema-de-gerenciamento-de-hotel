import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<div>Hotel Paradise - Em construção</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;