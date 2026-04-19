import React, { createContext, useContext, useState } from 'react';

const ExportacaoContext = createContext();

export const useExportacao = () => useContext(ExportacaoContext);

export const ExportacaoProvider = ({ children }) => {
  const [dadosExportacao, setDadosExportacao] = useState({
    colunas: [],
    linhas: [],
    titulo: ''
  });

  const atualizarDados = (colunas, linhas, titulo) => {
    setDadosExportacao({ colunas, linhas, titulo });
  };

  return (
    <ExportacaoContext.Provider value={{ dadosExportacao, atualizarDados }}>
      {children}
    </ExportacaoContext.Provider>
  );
};
