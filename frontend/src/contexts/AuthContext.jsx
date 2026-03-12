import React, { createContext, useState, useContext, useEffect } from 'react'
import { authService } from '@services/api'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('@HotelParadise:user')
        const storedToken = localStorage.getItem('@HotelParadise:token')
        
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser))
        }
      } catch (err) {
        console.error('Erro ao carregar usuário:', err)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials)
      const { user: userData, accessToken } = response.data.data
      
      localStorage.setItem('@HotelParadise:user', JSON.stringify(userData))
      localStorage.setItem('@HotelParadise:token', accessToken)
      
      setUser(userData)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Erro ao fazer login' }
    }
  }

  const logout = async () => {
    localStorage.removeItem('@HotelParadise:user')
    localStorage.removeItem('@HotelParadise:token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  )
}