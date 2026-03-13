import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../../frontend/src/services/api";  // ← CAMINHO CORRIGIDO!

const ClienteContext = createContext({});

export const useCliente = () => {
  const context = useContext(ClienteContext);
  if (!context) {
    throw new Error('useCliente deve ser usado dentro de ClienteProvider');
  }
  return context;
};

export const ClienteProvider = ({ children }) => {
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedCliente = localStorage.getItem('@HotelParadise:cliente');
    if (storedCliente) {
      try {
        setCliente(JSON.parse(storedCliente));
      } catch (err) {
        localStorage.removeItem('@HotelParadise:cliente');
      }
    }
  }, []);

  const identificarCliente = async (dados) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/clientes/identificar', dados);
      const clienteData = response.data.data;

      setCliente(clienteData);
      localStorage.setItem('@HotelParadise:cliente', JSON.stringify(clienteData));

      return { success: true, data: clienteData };
    } catch (err) {
      const message = err.response?.data?.message || 'Erro ao identificar cliente';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const buscarCliente = async (telefone) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/clientes/${telefone}`);
      return { success: true, data: response.data.data };
    } catch (err) {
      if (err.response?.status === 404) {
        return { success: false, error: 'Cliente não encontrado' };
      }
      const message = err.response?.data?.message || 'Erro ao buscar cliente';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const atualizarCliente = async (id, dados) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.put(`/clientes/${id}`, dados);
      const clienteData = response.data.data;

      setCliente(clienteData);
      localStorage.setItem('@HotelParadise:cliente', JSON.stringify(clienteData));

      return { success: true, data: clienteData };
    } catch (err) {
      const message = err.response?.data?.message || 'Erro ao atualizar cliente';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const limparCliente = () => {
    setCliente(null);
    localStorage.removeItem('@HotelParadise:cliente');
  };

  return (
    <ClienteContext.Provider
      value={{
        cliente,
        loading,
        error,
        identificarCliente,
        buscarCliente,
        atualizarCliente,
        limparCliente,
        isIdentificado: !!cliente
      }}
    >
      {children}
    </ClienteContext.Provider>
  );
};