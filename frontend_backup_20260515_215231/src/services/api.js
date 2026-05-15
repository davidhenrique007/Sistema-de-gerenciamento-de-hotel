import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  // ? TENTAR AMBAS AS CHAVES (admin e cliente)
  let token = localStorage.getItem('admin_token');
  
  if (!token) {
    token = localStorage.getItem('@HotelParadise:token');
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // ? Limpar ambas as chaves
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('@HotelParadise:token');
      localStorage.removeItem('@HotelParadise:user');
      
      // ? Redirecionar para login admin se estiver em rota admin
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/login-admin';
      } else {
        window.location.href = '/login-cliente';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  getPerfil: () => api.get('/auth/perfil'),
};

export default api;