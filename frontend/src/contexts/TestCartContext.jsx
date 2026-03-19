// =====================================================
// HOTEL PARADISE - TEST CART CONTEXT
// =====================================================

import React, { createContext, useState, useContext } from 'react';

const TestCartContext = createContext(null);

export const useTestCart = () => {
  const context = useContext(TestCartContext);
  if (!context) {
    throw new Error('useTestCart deve ser usado dentro de TestCartProvider');
  }
  return context;
};

export const TestCartProvider = ({ children }) => {
  const [testValue, setTestValue] = useState('funcionou!');

  console.log('🟢 TestCartProvider RENDERIZADO!');

  return (
    <TestCartContext.Provider value={{ testValue, setTestValue }}>
      {children}
    </TestCartContext.Provider>
  );
};
