import React, { createContext, useState, useContext, useEffect } from 'react'

const CartContext = createContext({})

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart deve ser usado dentro de CartProvider')
  return context
}

export const CartProvider = ({ children }) => {
  const [room, setRoom] = useState(null)
  const [checkIn, setCheckIn] = useState(null)
  const [checkOut, setCheckOut] = useState(null)
  const [guests, setGuests] = useState({ adults: 2, children: 0 })
  const [totalPrice, setTotalPrice] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('@HotelParadise:cart')
    if (saved) {
      const parsed = JSON.parse(saved)
      setRoom(parsed.room)
      setCheckIn(parsed.checkIn ? new Date(parsed.checkIn) : null)
      setCheckOut(parsed.checkOut ? new Date(parsed.checkOut) : null)
      setGuests(parsed.guests || { adults: 2, children: 0 })
      setTotalPrice(parsed.totalPrice || 0)
    }
  }, [])

  useEffect(() => {
    if (room || checkIn || checkOut) {
      localStorage.setItem('@HotelParadise:cart', JSON.stringify({
        room, checkIn, checkOut, guests, totalPrice
      }))
    }
  }, [room, checkIn, checkOut, guests, totalPrice])

  const selectRoom = (selectedRoom, selectedCheckIn, selectedCheckOut, selectedGuests) => {
    setRoom(selectedRoom)
    setCheckIn(selectedCheckIn)
    setCheckOut(selectedCheckOut)
    setGuests(selectedGuests)
    
    const nights = Math.ceil((selectedCheckOut - selectedCheckIn) / (1000 * 60 * 60 * 24))
    setTotalPrice(selectedRoom.price_per_night * nights)
  }

  const clearCart = () => {
    setRoom(null)
    setCheckIn(null)
    setCheckOut(null)
    setGuests({ adults: 2, children: 0 })
    setTotalPrice(0)
    localStorage.removeItem('@HotelParadise:cart')
  }

  return (
    <CartContext.Provider value={{
      room, checkIn, checkOut, guests, totalPrice,
      selectRoom, clearCart,
      hasReservation: !!room,
    }}>
      {children}
    </CartContext.Provider>
  )
}