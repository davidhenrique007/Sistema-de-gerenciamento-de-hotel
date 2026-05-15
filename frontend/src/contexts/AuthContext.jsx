import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';
import { useI18n } from './I18nContext';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useI18n(); // Consumindo i18n para traduzir mensagens

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      carregarUsuario(token);
    } else {
      setLoading(false);
    }
  }, []);

  const carregarUsuario = async (token) => {
    try {
      const response = await authService.getPerfil();
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (err) {
      console.error('Erro ao carregar usuário:', err);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await authService.login(email, password);
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setUser(user);
        
        // Mensagem de sucesso traduzida
        const successMessage = t('auth.success.login');
        console.log(successMessage);
        
        return { success: true, message: successMessage };
      } else {
        // Mapear mensagem de erro para chave i18n
        const errorKey = mapErrorToI18nKey(response.data.message);
        const errorMessage = t(errorKey);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'errors.server_error';
      const errorKey = mapErrorToI18nKey(message);
      const errorMessage = t(errorKey);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      // Mensagem de sucesso traduzida
      const successMessage = t('auth.success.logout');
      console.log(successMessage);
    } catch (err) {
      console.error('Erro no logout:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  // Função para mapear erros do backend para chaves i18n
  const mapErrorToI18nKey = (errorMessage) => {
    const errorMap = {
      'Credenciais inválidas': 'errors.invalid_credentials',
      'Invalid credentials': 'errors.invalid_credentials',
      'Utilizador não encontrado': 'errors.user_not_found',
      'User not found': 'errors.user_not_found',
      'Email não verificado': 'errors.email_not_verified',
      'Email not verified': 'errors.email_not_verified',
      'Conta bloqueada': 'errors.account_locked',
      'Account locked': 'errors.account_locked',
      'Erro interno do servidor': 'errors.server_error',
      'Internal server error': 'errors.server_error',
      'Erro de conexão': 'errors.network_error',
      'Connection error': 'errors.network_error'
    };
    
    return errorMap[errorMessage] || 'errors.login_failed';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      logout,
      setError 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
