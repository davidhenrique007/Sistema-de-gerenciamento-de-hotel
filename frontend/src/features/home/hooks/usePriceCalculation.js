import { useMemo } from 'react';
import { formatCurrency } from '../../../shared/utils/dateUtils';

// Constantes de taxas
const TAX_RATES = {
  SERVICE_TAX: 0.10, // 10% taxa de serviço
  TOURISM_TAX: 50,   // Taxa fixa por noite
};

/**
 * Hook personalizado para calcular preços da reserva
 * 
 * @param {Object} params - Parâmetros de cálculo
 * @returns {Object} Preços calculados
 */
const usePriceCalculation = ({ room, guests, nights, services = [] }) => {
  // ==========================================================================
  // CÁLCULOS MEMOIZADOS
  // ==========================================================================

  const calculations = useMemo(() => {
    // Valores padrão
    const defaultPrice = {
      subtotal: 0,
      tax: 0,
      total: 0,
      formatted: '0 MT',
    };

    if (!room || !nights || nights === 0) {
      return {
        roomPrice: defaultPrice,
        servicesPrice: defaultPrice,
        taxes: defaultPrice,
        total: defaultPrice,
        breakdown: [],
      };
    }

    // ========================================================================
    // PREÇO DO QUARTO
    // ========================================================================

    const roomSubtotal = room.price.amount * nights;
    const roomPrice = {
      subtotal: roomSubtotal,
      tax: roomSubtotal * TAX_RATES.SERVICE_TAX,
      total: roomSubtotal * (1 + TAX_RATES.SERVICE_TAX),
      formatted: formatCurrency(roomSubtotal * (1 + TAX_RATES.SERVICE_TAX)),
      description: `Quarto ${room.number} - ${room.typeLabel} (${nights} noites)`,
    };

    // ========================================================================
    // PREÇO DOS SERVIÇOS
    // ========================================================================

    const servicesBreakdown = services.map(service => {
      const serviceTotal = service.price * nights;
      return {
        id: service.id,
        name: service.name,
        quantity: nights,
        unitPrice: service.price,
        total: serviceTotal,
        formatted: formatCurrency(serviceTotal),
      };
    });

    const servicesSubtotal = servicesBreakdown.reduce((sum, s) => sum + s.total, 0);
    const servicesPrice = {
      subtotal: servicesSubtotal,
      tax: servicesSubtotal * TAX_RATES.SERVICE_TAX,
      total: servicesSubtotal * (1 + TAX_RATES.SERVICE_TAX),
      formatted: formatCurrency(servicesSubtotal * (1 + TAX_RATES.SERVICE_TAX)),
      items: servicesBreakdown,
    };

    // ========================================================================
    // TAXAS ADICIONAIS
    // ========================================================================

    const tourismTaxTotal = TAX_RATES.TOURISM_TAX * nights;
    const taxes = {
      serviceTax: roomSubtotal * TAX_RATES.SERVICE_TAX + servicesSubtotal * TAX_RATES.SERVICE_TAX,
      tourismTax: tourismTaxTotal,
      total: roomSubtotal * TAX_RATES.SERVICE_TAX + servicesSubtotal * TAX_RATES.SERVICE_TAX + tourismTaxTotal,
      formatted: formatCurrency(
        roomSubtotal * TAX_RATES.SERVICE_TAX + 
        servicesSubtotal * TAX_RATES.SERVICE_TAX + 
        tourismTaxTotal
      ),
      breakdown: [
        {
          name: 'Taxa de serviço (10%)',
          amount: roomSubtotal * TAX_RATES.SERVICE_TAX + servicesSubtotal * TAX_RATES.SERVICE_TAX,
          formatted: formatCurrency(roomSubtotal * TAX_RATES.SERVICE_TAX + servicesSubtotal * TAX_RATES.SERVICE_TAX),
        },
        {
          name: 'Taxa de turismo',
          amount: tourismTaxTotal,
          formatted: formatCurrency(tourismTaxTotal),
        },
      ],
    };

    // ========================================================================
    // TOTAL GERAL
    // ========================================================================

    const totalAmount = roomPrice.total + servicesPrice.total + taxes.total;
    
    const total = {
      subtotal: roomSubtotal + servicesSubtotal,
      tax: roomPrice.tax + servicesPrice.tax + taxes.tourismTax,
      total: totalAmount,
      formatted: formatCurrency(totalAmount),
    };

    // ========================================================================
    // BREAKDOWN PARA EXIBIÇÃO
    // ========================================================================

    const breakdown = [
      {
        id: 'room',
        label: 'Quarto',
        amount: roomPrice.total,
        formatted: roomPrice.formatted,
        details: roomPrice.description,
      },
      ...servicesBreakdown.map(s => ({
        id: `service-${s.id}`,
        label: s.name,
        amount: s.total,
        formatted: s.formatted,
        details: `${s.quantity} noite(s) x ${formatCurrency(s.unitPrice)}`,
      })),
      {
        id: 'taxes',
        label: 'Taxas',
        amount: taxes.total,
        formatted: taxes.formatted,
        details: 'Taxa de serviço + taxa de turismo',
      },
    ];

    return {
      roomPrice,
      servicesPrice,
      taxes,
      total,
      breakdown,
    };
  }, [room, nights, services]);

  // ==========================================================================
  // RETORNO
  // ==========================================================================

  return calculations;
};

export default usePriceCalculation;