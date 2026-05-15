import React, { createContext, useContext, useState, useEffect } from 'react';

const ServicesContext = createContext();

export const useServices = () => {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error('useServices must be used within ServicesProvider');
  }
  return context;
};

export const ServicesProvider = ({ children }) => {
  const [servicosSelecionados, setServicosSelecionados] = useState([]);

  // Carregar serviços do localStorage ao iniciar
  useEffect(() => {
    const saved = localStorage.getItem('servicos_selecionados');
    if (saved) {
      try {
        setServicosSelecionados(JSON.parse(saved));
      } catch (e) {
        console.error('Erro ao carregar serviços:', e);
      }
    }
  }, []);

  // Salvar serviços no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('servicos_selecionados', JSON.stringify(servicosSelecionados));
  }, [servicosSelecionados]);

  const adicionarServico = (servico) => {
    setServicosSelecionados(prev => {
      const existe = prev.find(s => s.id === servico.id);
      if (existe) {
        return prev;
      }
      return [...prev, servico];
    });
  };

  const removerServico = (servicoId) => {
    setServicosSelecionados(prev => prev.filter(s => s.id !== servicoId));
  };

  const limparServicos = () => {
    setServicosSelecionados([]);
  };

  const getTotalServicos = (nights = 1) => {
    return servicosSelecionados.reduce((total, servico) => {
      const preco = servico.tipo === 'por_noite' 
        ? servico.preco * nights 
        : servico.preco;
      return total + preco;
    }, 0);
  };

  return (
    <ServicesContext.Provider value={{
      servicosSelecionados,
      adicionarServico,
      removerServico,
      limparServicos,
      getTotalServicos,
      totalServicos: servicosSelecionados.length
    }}>
      {children}
    </ServicesContext.Provider>
  );
};
