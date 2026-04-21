// =====================================================
// HOTEL PARADISE - AUTH CONTEXT (ATUALIZADO)
// Versão: 1.1.0
// =====================================================

import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('@HotelParadise:user');
        const storedToken = localStorage.getItem('@HotelParadise:token');
        
        if (storedUser && storedToken) {
          // Validar token com backend
          const response = await authService.getProfile();
          setUser(response.data.data);
        }
      } catch (err) {
        console.error('Erro ao carregar usuário:', err);
        localStorage.removeItem('@HotelParadise:user');
        localStorage.removeItem('@HotelParadise:token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Função de login
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authService.login({ email, password });
      const { user: userData, accessToken } = response.data.data;
      
      // Salvar no localStorage
      localStorage.setItem('@HotelParadise:user', JSON.stringify(userData));
      localStorage.setItem('@HotelParadise:token', accessToken);
      
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || 'Erro ao fazer login';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Erro no logout:', err);
    } finally {
      // Limpar localStorage
      localStorage.removeItem('@HotelParadise:user');
      localStorage.removeItem('@HotelParadise:token');
      setUser(null);
    }
  };

  // Função para atualizar dados do usuário
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('@HotelParadise:user', JSON.stringify(userData));
  };

  // Função para refresh token (chamada automaticamente pelo interceptor)
  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken();
      const { accessToken } = response.data.data;
      
      localStorage.setItem('@HotelParadise:token', accessToken);
      return accessToken;
    } catch (err) {
      // Se refresh falhar, fazer logout
      await logout();
      throw err;
    }
  };

  // Verificar se tem permissão
  const hasPermission = (allowedRoles) => {
    if (!user) return false;
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        updateUser,
        refreshToken,
        hasPermission,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isReceptionist: user?.role === 'receptionist',
        isFinancial: user?.role === 'financial',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};