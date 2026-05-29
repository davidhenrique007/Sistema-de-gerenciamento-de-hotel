import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';

const ClienteContext = createContext({});

export const useCliente = () => {
  const context = useContext(ClienteContext);
  if (!context) throw new Error('useCliente deve ser usado dentro de ClienteProvider');
  return context;
};

export const ClienteProvider = ({ children }) => {
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Normaliza o cliente — garante que name/nome, phone/telefone existem sempre
    const normalizarCliente = (c) => {
    if (!c) return null;
    const name  = c.name  || c.nome      || '';
    const phone = c.phone || c.telefone  || '';
    const doc   = c.document || c.documento || '';
    return {
      id:            c.id,
      guest_id:      c.guest_id,        // ✅ UUID para reservas
      name,  nome:  name,
      phone, telefone: phone,
      document: doc, documento: doc,
      email:         c.email || '',
      created_at:    c.created_at || c.data_cadastro || '',
      data_cadastro: c.data_cadastro || c.created_at || '',
    };
  };

  // AO INICIAR: restaura sessão do localStorage imediatamente
  useEffect(() => {
    const restaurarSessao = () => {
      try {
        const stored    = localStorage.getItem('@HotelParadise:cliente');
        const timestamp = localStorage.getItem('@HotelParadise:cliente_timestamp');

        if (stored && timestamp) {
          const parsed  = JSON.parse(stored);
          const umaHora = 60 * 60 * 1000;

          if (Date.now() - parseInt(timestamp) > umaHora) {
            console.log('⏰ Sessão expirada');
            localStorage.removeItem('@HotelParadise:cliente');
            localStorage.removeItem('@HotelParadise:cliente_timestamp');
            localStorage.removeItem('@HotelParadise:token');
          } else {
            const c = normalizarCliente(parsed);
            console.log('🔄 Sessão restaurada:', c.name);
            setCliente(c);
          }
        }
      } catch (err) {
        console.error('Erro ao restaurar sessão:', err);
        localStorage.removeItem('@HotelParadise:cliente');
        localStorage.removeItem('@HotelParadise:cliente_timestamp');
        localStorage.removeItem('@HotelParadise:token');
      } finally {
        setLoading(false);
      }
    };
    restaurarSessao();
  }, []);

  // Persiste no localStorage quando cliente muda
  useEffect(() => {
    if (cliente) {
      localStorage.setItem('@HotelParadise:cliente', JSON.stringify(cliente));
      localStorage.setItem('@HotelParadise:cliente_timestamp', Date.now().toString());
    }
  }, [cliente]);

  // IDENTIFICAR CLIENTE
  const identificarCliente = async (dados) => {
    try {
      setLoading(true);
      setError(null);

      // server.js espera { nome, telefone, documento, email }
      const dadosParaBackend = {
        nome:      dados.nome      || dados.name     || '',
        telefone:  dados.telefone  || dados.phone    || '',
        documento: dados.documento || dados.document || '',
        email:     dados.email     || '',
      };

      console.log('📤 Enviando para backend:', dadosParaBackend);

      const response = await api.post('/clientes/identificar', dadosParaBackend);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      // server.js devolve { success, data: cliente, token }
      const raw = response.data.data;
      const clienteNormalizado = normalizarCliente(raw);

      if (!clienteNormalizado.name) {
        throw new Error('Dados do cliente inválidos na resposta');
      }

      // ✅ Guarda token JWT
      if (response.data.token) {
        localStorage.setItem('@HotelParadise:token', response.data.token);
        console.log('✅ Token salvo no localStorage');
      }

      setCliente(clienteNormalizado);
      return { success: true, data: clienteNormalizado };

    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Erro ao identificar cliente';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logoutCliente = useCallback(() => {
    localStorage.removeItem('@HotelParadise:cliente');
    localStorage.removeItem('@HotelParadise:cliente_timestamp');
    localStorage.removeItem('@HotelParadise:token');
    setCliente(null);
    setError(null);
  }, []);

  const trocarCliente = useCallback(() => logoutCliente(), [logoutCliente]);

  const atualizarCliente = async (id, dados) => {
    try {
      setLoading(true);
      const response = await api.put(`/clientes/${id}`, dados);
      const c = normalizarCliente(response.data.data);
      setCliente(c);
      return { success: true, data: c };
    } catch (err) {
      const message = err.response?.data?.message || 'Erro ao atualizar cliente';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const verificarAcesso = useCallback(() => {
    if (!cliente) return { permitido: false, motivo: 'nao_identificado', redirectTo: '/login-cliente' };
    return { permitido: true, motivo: null, redirectTo: null };
  }, [cliente]);

  const renovarSessao = useCallback(() => {
    if (cliente) localStorage.setItem('@HotelParadise:cliente_timestamp', Date.now().toString());
  }, [cliente]);

  return (
    <ClienteContext.Provider value={{
      cliente,
      loading,
      error,
      identificarCliente,
      logoutCliente,
      trocarCliente,
      atualizarCliente,
      renovarSessao,
      verificarAcesso,
      isIdentificado:  !!cliente,
      isAuthenticated: !!cliente,
      nome:         cliente?.name  || '',
      nomeCompleto: cliente?.name  || '',
      primeiroNome: cliente?.name?.split(' ')[0] || '',
      telefone:     cliente?.phone || '',
      documento:    cliente?.document || '',
      email:        cliente?.email || '',
      ultimaAtualizacao: null,
    }}>
      {children}
    </ClienteContext.Provider>
  );
};

