// =====================================================
// HOTEL PARADISE - CONTEXT DE CLIENTE
// VersÃ£o: 2.0.0 (Completa - SessÃ£o)
// =====================================================

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);

  // =====================================================
  // CARREGAR CLIENTE DO LOCALSTORAGE AO INICIAR
  // =====================================================
  useEffect(() => {
    const carregarCliente = async () => {
      try {
        const storedCliente = localStorage.getItem('@HotelParadise:cliente');
        const storedTimestamp = localStorage.getItem('@HotelParadise:cliente_timestamp');
        
        if (storedCliente && storedTimestamp) {
          const parsedCliente = JSON.parse(storedCliente);
          const timestamp = parseInt(storedTimestamp);
          const agora = Date.now();
          const umaHora = 60 * 60 * 1000; // 1 hora em ms
          
          // Verificar se a sessÃ£o expirou (1 hora de inatividade)
          if (agora - timestamp > umaHora) {
            console.log('â° SessÃ£o expirada - removendo');
            localStorage.removeItem('@HotelParadise:cliente');
            localStorage.removeItem('@HotelParadise:cliente_timestamp');
            setCliente(null);
          } else {
            console.log('ðŸ”„ SessÃ£o restaurada do localStorage');
            setCliente(parsedCliente);
            setUltimaAtualizacao(new Date(timestamp));
            
            // Opcional: validar com backend se cliente ainda existe
            try {
              await api.get(`/clientes/${parsedCliente.phone}`);
            } catch (err) {
              console.log('âš ï¸ Cliente nÃ£o encontrado no backend, removendo sessÃ£o');
              localStorage.removeItem('@HotelParadise:cliente');
              localStorage.removeItem('@HotelParadise:cliente_timestamp');
              setCliente(null);
            }
          }
        }
      } catch (err) {
        console.error('Erro ao carregar cliente:', err);
        localStorage.removeItem('@HotelParadise:cliente');
        localStorage.removeItem('@HotelParadise:cliente_timestamp');
      } finally {
        setLoading(false);
      }
    };

    carregarCliente();
  }, []);

  // =====================================================
  // ATUALIZAR TIMESTAMP QUANDO CLIENTE MUDA
  // =====================================================
  useEffect(() => {
    if (cliente) {
      localStorage.setItem('@HotelParadise:cliente', JSON.stringify(cliente));
      localStorage.setItem('@HotelParadise:cliente_timestamp', Date.now().toString());
      setUltimaAtualizacao(new Date());
    }
  }, [cliente]);

  // =====================================================
  // FUNÃ‡ÃƒO PARA IDENTIFICAR CLIENTE
  // =====================================================
  const identificarCliente = async (dados) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/clientes/identificar', dados);
      const clienteData = response.data.data;

      setCliente(clienteData);
      
      return { success: true, data: clienteData };
    } catch (err) {
      const message = err.response?.data?.message || 'Erro ao identificar cliente';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FUNÃ‡ÃƒO PARA LOGOUT
  // =====================================================
  const logoutCliente = useCallback(() => {
    console.log('ðŸ‘‹ Cliente fazendo logout');
    setCliente(null);
    localStorage.removeItem('@HotelParadise:cliente');
    localStorage.removeItem('@HotelParadise:cliente_timestamp');
    setUltimaAtualizacao(null);
  }, []);

  // =====================================================
  // FUNÃ‡ÃƒO PARA TROCAR DE CLIENTE
  // =====================================================
  const trocarCliente = useCallback(() => {
    logoutCliente();
    // Redirecionamento serÃ¡ feito pelo componente que chamar
  }, [logoutCliente]);

  // =====================================================
  // FUNÃ‡ÃƒO PARA ATUALIZAR DADOS DO CLIENTE
  // =====================================================
  const atualizarCliente = async (id, dados) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.put(`/clientes/${id}`, dados);
      const clienteData = response.data.data;

      setCliente(clienteData);
      
      return { success: true, data: clienteData };
    } catch (err) {
      const message = err.response?.data?.message || 'Erro ao atualizar cliente';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FUNÃ‡ÃƒO PARA VERIFICAR SE TEM PERMISSÃƒO
  // =====================================================
  const verificarAcesso = useCallback(() => {
    if (!cliente) {
      return {
        permitido: false,
        motivo: 'nao_identificado',
        redirectTo: '/login-cliente'
      };
    }
    
    return {
      permitido: true,
      motivo: null,
      redirectTo: null
    };
  }, [cliente]);

  // =====================================================
  // FUNÃ‡ÃƒO PARA RENOVAR SESSÃƒO
  // =====================================================
  const renovarSessao = useCallback(() => {
    if (cliente) {
      localStorage.setItem('@HotelParadise:cliente_timestamp', Date.now().toString());
      setUltimaAtualizacao(new Date());
    }
  }, [cliente]);

  return (
    <ClienteContext.Provider
      value={{
        // Estado
        cliente,
        loading,
        error,
        ultimaAtualizacao,
        
        // FunÃ§Ãµes principais
        identificarCliente,
        logoutCliente,
        trocarCliente,
        atualizarCliente,
        renovarSessao,
        
        // UtilitÃ¡rios
        verificarAcesso,
        
        // Flags
        isIdentificado: !!cliente,
        isAuthenticated: !!cliente, // alias para compatibilidade
        
        // Dados formatados
        nome: cliente?.name?.split(' ')[0] || null,
        nomeCompleto: cliente?.name || null,
        primeiroNome: cliente?.name?.split(' ')[0] || null,
        telefone: cliente?.phone || null,
        documento: cliente?.document || null,
        email: cliente?.email || null,
      }}
    >
      {children}
    </ClienteContext.Provider>
  );
};
