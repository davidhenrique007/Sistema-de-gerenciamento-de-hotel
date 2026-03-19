// =====================================================
// HOTEL PARADISE - CART CONTEXT (ORIGINAL)
// =====================================================

import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext({});

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart deve ser usado dentro de CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const [reservation, setReservation] = useState(null);
  const [room, setRoom] = useState(null);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState({ adults: 2, children: 0 });
  const [extras, setExtras] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('@HotelParadise:cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setReservation(parsed.reservation || null);
        setRoom(parsed.room || null);
        setCheckIn(parsed.checkIn ? new Date(parsed.checkIn) : null);
        setCheckOut(parsed.checkOut ? new Date(parsed.checkOut) : null);
        setGuests(parsed.guests || { adults: 2, children: 0 });
        setExtras(parsed.extras || []);
        setTotalPrice(parsed.totalPrice || 0);
      } catch (e) {
        console.error('Erro ao carregar carrinho:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (room || checkIn || checkOut) {
      localStorage.setItem('@HotelParadise:cart', JSON.stringify({
        reservation, room, checkIn, checkOut, guests, extras, totalPrice
      }));
    }
  }, [reservation, room, checkIn, checkOut, guests, extras, totalPrice]);

  const selectRoom = (selectedRoom, selectedCheckIn, selectedCheckOut, selectedGuests) => {
    console.log('selectRoom chamado!', { selectedRoom, selectedCheckIn, selectedCheckOut, selectedGuests });
    
    const nights = Math.ceil((selectedCheckOut - selectedCheckIn) / (1000 * 60 * 60 * 24));
    const price = selectedRoom.price_per_night * nights;

    const reservationData = {
      roomId: selectedRoom.id,
      roomNumber: selectedRoom.room_number,
      roomType: selectedRoom.type,
      checkIn: selectedCheckIn,
      checkOut: selectedCheckOut,
      guests: selectedGuests,
      nights,
      pricePerNight: selectedRoom.price_per_night,
      subtotal: price,
      taxes: Math.round(price * 0.1),
      total: price + Math.round(price * 0.1)
    };

    setReservation(reservationData);
    setRoom(selectedRoom);
    setCheckIn(selectedCheckIn);
    setCheckOut(selectedCheckOut);
    setGuests(selectedGuests);
    setTotalPrice(reservationData.total);
  };

  const addExtra = (extra) => {
    setExtras([...extras, extra]);
    setTotalPrice(totalPrice + extra.price);
  };

  const removeExtra = (extraId) => {
    const extra = extras.find(e => e.id === extraId);
    setExtras(extras.filter(e => e.id !== extraId));
    setTotalPrice(totalPrice - extra.price);
  };

  const clearCart = () => {
    setReservation(null);
    setRoom(null);
    setCheckIn(null);
    setCheckOut(null);
    setGuests({ adults: 2, children: 0 });
    setExtras([]);
    setTotalPrice(0);
    localStorage.removeItem('@HotelParadise:cart');
  };

  return (
    <CartContext.Provider value={{
      reservation,
      room,
      checkIn,
      checkOut,
      guests,
      extras,
      totalPrice,
      selectRoom,
      addExtra,
      removeExtra,
      clearCart,
      hasReservation: !!room,
    }}>
      {children}
    </CartContext.Provider>
  );
};
