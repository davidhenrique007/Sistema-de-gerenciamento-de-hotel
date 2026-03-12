import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Interceptors
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@HotelParadise:token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('@HotelParadise:token')
      localStorage.removeItem('@HotelParadise:refreshToken')
      localStorage.removeItem('@HotelParadise:user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Serviços
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
}

export const userService = {
  getProfile: () => api.get('/users/profile'),
}

export const roomService = {
  getAll: (params) => api.get('/rooms', { params }),
  getAvailable: (checkIn, checkOut, type) => 
    api.get('/rooms/available', { params: { checkIn, checkOut, type } }),
}

export const reservationService = {
  create: (data) => api.post('/reservations', data),
}

export default api