// =====================================================
// HOTEL PARADISE - API SERVICE
// =====================================================

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@HotelParadise:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('@HotelParadise:token');
      localStorage.removeItem('@HotelParadise:user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ✅ EXPORTAÇÃO PADRÃO (default)
export default api;

// ✅ EXPORTAÇÕES NOMEADAS (opcionais)
export const clienteService = {
  identificar: (dados) => api.post('/clientes/identificar', dados),
  buscarPorTelefone: (telefone) => api.get(`/clientes/${telefone}`),
  criar: (dados) => api.post('/clientes', dados),
  atualizar: (id, dados) => api.put(`/clientes/${id}`, dados),
};

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  loginAdmin: (credentials) => api.post('/auth/admin/login', credentials),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
};

export const roomService = {
  listar: (params) => api.get('/rooms', { params }),
  buscarPorId: (id) => api.get(`/rooms/${id}`),
  disponiveis: (checkIn, checkOut, tipo) => 
    api.get('/rooms/available', { params: { checkIn, checkOut, tipo } }),
};

export const reservationService = {
  criar: (dados) => api.post('/reservations', dados),
  listar: (params) => api.get('/reservations', { params }),
  cancelar: (id, motivo) => api.post(`/reservations/${id}/cancel`, { motivo }),
};