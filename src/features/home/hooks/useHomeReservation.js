// ============================================
// HOOK: useHomeReservation
// ============================================
// Responsabilidade: Gerenciar estado central da reserva na Home
// Fonte única de verdade para dados da reserva
// ============================================

import { useState, useMemo, useCallback } from 'react';

// ============================================
// CONSTANTES
// ============================================

const TAX_CONFIG = {
  serviceTax: 0.10, // 10% de taxa de serviço
  cityTax: 0.05,    // 5% de taxa municipal
  vat: 0.23         // 23% de IVA
};

// ============================================
// ESTADO INICIAL
// ============================================

const initialReservationState = {
  // Dados de seleção
  room: null,
  checkIn: null,
  checkOut: null,
  guests: 1,
  selectedServices: [],
  
  // Metadados
  nights: 0,
  isValid: false,
  
  // Preços (serão calculados)
  roomPrice: 0,
  servicesPrice: 0,
  taxes: 0,
  totalPrice: 0
};

// ============================================
// HOOK PRINCIPAL
// ============================================

export const useHomeReservation = ({
  // Dependências injetadas (opcionais)
  calculatePriceUseCase,
  pricingService,
  
  // Configurações
  applyTaxes = true,
  maxGuestsPerRoom = 10,
  
  // Callbacks
  onReservationChange,
  onPriceCalculated
} = {}) => {
  // ========================================
  // ESTADO PRIMÁRIO
  // ========================================
  
  const [room, setRoom] = useState(null);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);
  const [selectedServices, setSelectedServices] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [priceBreakdown, setPriceBreakdown] = useState(null);

  // ========================================
  // ESTADO DERIVADO - CÁLCULOS
  // ========================================
  
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }, [checkIn, checkOut]);

  const canCalculate = useMemo(() => {
    return room && checkIn && checkOut && guests > 0 && nights > 0;
  }, [room, checkIn, checkOut, guests, nights]);

  // ========================================
  // FUNÇÕES DE ATUALIZAÇÃO
  // ========================================
  
  const selectRoom = useCallback((selectedRoom) => {
    setRoom(selectedRoom);
    
    // Resetar serviços ao mudar de quarto (opcional)
    setSelectedServices([]);
    
    if (onReservationChange) {
      onReservationChange({
        room: selectedRoom,
        checkIn,
        checkOut,
        guests,
        selectedServices: []
      });
    }
  }, [checkIn, checkOut, guests, onReservationChange]);

  const setDates = useCallback((newCheckIn, newCheckOut) => {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
    
    if (onReservationChange) {
      onReservationChange({
        room,
        checkIn: newCheckIn,
        checkOut: newCheckOut,
        guests,
        selectedServices
      });
    }
  }, [room, guests, selectedServices, onReservationChange]);

  const setGuestsCount = useCallback((newGuests) => {
    // Validar limite máximo
    if (room && newGuests > room.capacity) {
      console.warn(`Número de hóspedes excede a capacidade do quarto (${room.capacity})`);
      return;
    }
    
    if (newGuests > maxGuestsPerRoom) {
      console.warn(`Número de hóspedes excede o limite máximo (${maxGuestsPerRoom})`);
      return;
    }
    
    setGuests(newGuests);
    
    if (onReservationChange) {
      onReservationChange({
        room,
        checkIn,
        checkOut,
        guests: newGuests,
        selectedServices
      });
    }
  }, [room, checkIn, checkOut, selectedServices, maxGuestsPerRoom, onReservationChange]);

  const toggleService = useCallback((serviceId) => {
    setSelectedServices(prev => {
      const isSelected = prev.includes(serviceId);
      const newSelection = isSelected
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId];
      
      if (onReservationChange) {
        onReservationChange({
          room,
          checkIn,
          checkOut,
          guests,
          selectedServices: newSelection
        });
      }
      
      return newSelection;
    });
  }, [room, checkIn, checkOut, guests, onReservationChange]);

  const clearReservation = useCallback(() => {
    setRoom(null);
    setCheckIn(null);
    setCheckOut(null);
    setGuests(1);
    setSelectedServices([]);
    setPriceBreakdown(null);
    
    if (onReservationChange) {
      onReservationChange({
        room: null,
        checkIn: null,
        checkOut: null,
        guests: 1,
        selectedServices: []
      });
    }
  }, [onReservationChange]);

  // ========================================
  // CÁLCULO DE PREÇOS
  // ========================================
  
  const calculatePrice = useCallback(async () => {
    if (!canCalculate) return null;
    
    setIsCalculating(true);
    
    try {
      let breakdown;
      
      // Usar use case se disponível, senão calcular localmente
      if (calculatePriceUseCase) {
        breakdown = await calculatePriceUseCase.execute({
          roomId: room.id,
          checkIn,
          checkOut,
          guestsCount: guests,
          serviceIds: selectedServices
        });
      } else if (pricingService) {
        // Cálculo local simplificado
        const roomTotal = room.pricePerNight * nights;
        const servicesTotal = selectedServices.reduce((sum, id) => {
          // Simulação - em produção, buscaria o serviço
          return sum + 50; // Valor fixo para exemplo
        }, 0);
        
        const subtotal = roomTotal + servicesTotal;
        const taxes = applyTaxes ? {
          serviceTax: subtotal * TAX_CONFIG.serviceTax,
          cityTax: subtotal * TAX_CONFIG.cityTax,
          vat: subtotal * TAX_CONFIG.vat,
          total: subtotal * (TAX_CONFIG.serviceTax + TAX_CONFIG.cityTax + TAX_CONFIG.vat)
        } : { total: 0 };
        
        const total = subtotal + (taxes.total || 0);
        
        breakdown = {
          roomId: room.id,
          roomNumber: room.number,
          nights,
          guestsCount: guests,
          roomPrice: { subtotal: roomTotal },
          services: selectedServices.map(id => ({ id, subtotal: 50 })),
          taxes,
          total: { amount: total }
        };
      } else {
        throw new Error('Nenhum serviço de cálculo disponível');
      }
      
      setPriceBreakdown(breakdown);
      
      if (onPriceCalculated) {
        onPriceCalculated(breakdown);
      }
      
      return breakdown;
    } catch (error) {
      console.error('Erro ao calcular preço:', error);
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, [room, checkIn, checkOut, guests, selectedServices, nights, canCalculate, calculatePriceUseCase, pricingService, applyTaxes, onPriceCalculated]);

  // Calcular automaticamente quando os dados mudarem
  useMemo(() => {
    if (canCalculate) {
      calculatePrice();
    } else {
      setPriceBreakdown(null);
    }
  }, [canCalculate, room, checkIn, checkOut, guests, selectedServices, calculatePrice]);

  // ========================================
  // ESTADO CONSOLIDADO
  // ========================================
  
  const reservationState = useMemo(() => ({
    // Dados de seleção
    room,
    checkIn,
    checkOut,
    guests,
    selectedServices,
    
    // Metadados
    nights,
    hasRoom: !!room,
    hasDates: !!(checkIn && checkOut),
    isValid: canCalculate,
    
    // Preços
    priceBreakdown,
    isCalculating,
    
    // Totais simplificados
    roomTotal: priceBreakdown?.roomPrice?.subtotal || 0,
    servicesTotal: priceBreakdown?.services?.reduce((sum, s) => sum + s.subtotal, 0) || 0,
    taxesTotal: priceBreakdown?.taxes?.total || 0,
    total: priceBreakdown?.total?.amount || 0
  }), [room, checkIn, checkOut, guests, selectedServices, nights, canCalculate, priceBreakdown, isCalculating]);

  // ========================================
  // RETORNO
  // ========================================
  
  return {
    // Estado
    reservationState,
    
    // Dados brutos
    room,
    checkIn,
    checkOut,
    guests,
    selectedServices,
    
    // Metadados
    nights,
    hasRoom: !!room,
    hasDates: !!(checkIn && checkOut),
    isValid: canCalculate,
    
    // Preços
    priceBreakdown,
    isCalculating,
    
    // Ações de seleção
    selectRoom,
    setDates,
    setGuests: setGuestsCount,
    toggleService,
    
    // Cálculo
    calculatePrice,
    
    // Reset
    clearReservation
  };
};