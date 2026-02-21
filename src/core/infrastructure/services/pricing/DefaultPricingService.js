// ============================================
// SERVICE: DefaultPricingService
// ============================================
// Responsabilidade: Centralizar lógica técnica de cálculo de preços
// Padrões: Service Layer, Strategy Pattern
// ============================================

// ============================================
// IMPORTAÇÕES
// ============================================
import { Money, zeroMoney, sumMoney } from '../../../domain/value-objects/Money.js';
import { ServiceType } from '../../../domain/entities/Service.js';
import { AppError, ValidationError } from '../../../../shared/utils/errorUtils.js';
import { createLogger } from '../../../utils.js';

// ============================================
// CONSTANTES - CONFIGURAÇÕES DE TAXAS
// ============================================

const DEFAULT_TAX_CONFIG = {
  serviceTax: 0.10, // 10% de taxa de serviço
  cityTax: 0.05,    // 5% de taxa municipal
  vat: 0.23,        // 23% de IVA
  touristTax: 2.50  // Taxa turística fixa por noite
};

// ============================================
// CONSTANTES - CONFIGURAÇÕES DE DESCONTOS
// ============================================

const DEFAULT_DISCOUNT_CONFIG = {
  volumeDiscounts: [
    { minItems: 3, discount: 0.10 }, // 10% para 3+ serviços
    { minItems: 5, discount: 0.15 }, // 15% para 5+ serviços
    { minItems: 10, discount: 0.20 } // 20% para 10+ serviços
  ],
  seasonalDiscounts: [
    { month: 12, discount: 0.15 }, // Natal: 15%
    { month: 1, discount: 0.10 },  // Ano Novo: 10%
    { month: 7, discount: 0.10 }   // Julho: 10%
  ],
  maxTotalDiscount: 0.30, // 30% máximo acumulado
  earlyBirdDiscount: 0.05, // 5% para reservas com 30+ dias de antecedência
  lastMinuteDiscount: 0.10 // 10% para reservas com < 3 dias de antecedência
};

// ============================================
// DTOs - DATA TRANSFER OBJECTS
// ============================================

/**
 * DTO para item de serviço no breakdown
 */
class ServiceBreakdownItem {
  constructor(service, quantity, nights, guests, subtotal) {
    this.serviceId = service.id;
    this.serviceName = service.name;
    this.serviceType = service.type;
    this.pricePerUnit = service.price.amount;
    this.pricePerUnitFormatted = service.price.toString();
    this.quantity = quantity;
    this.nights = nights;
    this.guests = guests;
    this.subtotal = subtotal.amount;
    this.subtotalFormatted = subtotal.toString();
    this.calculationFormula = this._getFormula(service.type, nights, guests, quantity);
  }

  _getFormula(type, nights, guests, quantity) {
    const formulas = {
      [ServiceType.PER_NIGHT]: `${quantity} × ${nights} noites`,
      [ServiceType.PER_STAY]: `${quantity} × estadia`,
      [ServiceType.PER_PERSON]: `${quantity} × ${guests} pessoas`,
      [ServiceType.PER_PERSON_NIGHT]: `${quantity} × ${guests} pessoas × ${nights} noites`
    };
    return formulas[type] || 'cálculo personalizado';
  }

  toJSON() {
    return {
      serviceId: this.serviceId,
      serviceName: this.serviceName,
      serviceType: this.serviceType,
      pricePerUnit: this.pricePerUnit,
      pricePerUnitFormatted: this.pricePerUnitFormatted,
      quantity: this.quantity,
      nights: this.nights,
      guests: this.guests,
      subtotal: this.subtotal,
      subtotalFormatted: this.subtotalFormatted,
      calculationFormula: this.calculationFormula
    };
  }
}

/**
 * DTO para breakdown completo de preços
 */
export class PriceBreakdown {
  constructor({
    room,
    dateRange,
    guestsCount,
    services = [],
    discounts = [],
    taxes = {},
    subtotal,
    total
  }) {
    this.roomId = room.id;
    this.roomNumber = room.number;
    this.roomType = room.type;
    this.guestsCount = guestsCount;
    this.nights = dateRange.getNights();
    this.checkIn = dateRange.checkIn.toISOString().split('T')[0];
    this.checkOut = dateRange.checkOut.toISOString().split('T')[0];
    this.services = services;
    this.discounts = discounts;
    this.taxes = taxes;
    this.subtotal = {
      amount: subtotal.amount,
      formatted: subtotal.toString()
    };
    this.total = {
      amount: total.amount,
      formatted: total.toString()
    };
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      roomId: this.roomId,
      roomNumber: this.roomNumber,
      roomType: this.roomType,
      guestsCount: this.guestsCount,
      nights: this.nights,
      checkIn: this.checkIn,
      checkOut: this.checkOut,
      services: this.services.map(s => s.toJSON()),
      discounts: this.discounts,
      taxes: this.taxes,
      subtotal: this.subtotal,
      total: this.total,
      timestamp: this.timestamp
    };
  }
}

// ============================================
// SERVIÇO PRINCIPAL
// ============================================

export class DefaultPricingService {
  /**
   * @param {Object} options - Opções de configuração
   * @param {Object} options.taxConfig - Configuração de impostos
   * @param {Object} options.discountConfig - Configuração de descontos
   * @param {Object} options.logger - Logger (opcional)
   */
  constructor({ 
    taxConfig = DEFAULT_TAX_CONFIG,
    discountConfig = DEFAULT_DISCOUNT_CONFIG,
    logger = createLogger('DefaultPricingService')
  } = {}) {
    this.taxConfig = taxConfig;
    this.discountConfig = discountConfig;
    this.logger = logger;
  }

  /**
   * Calcula o preço total de uma reserva
   * @param {Object} params - Parâmetros de cálculo
   * @param {Room} params.room - Entidade Room
   * @param {DateRange} params.dateRange - Período da reserva
   * @param {number} params.guestsCount - Número de hóspedes
   * @param {Array<Service>} params.services - Lista de serviços
   * @param {Object} params.options - Opções adicionais
   * @param {Date} params.options.checkInDate - Data de check-in (para descontos sazonais)
   * @param {boolean} params.options.applyTaxes - Aplicar impostos (default: true)
   * @param {boolean} params.options.applyDiscounts - Aplicar descontos (default: true)
   * @returns {PriceBreakdown} Breakdown detalhado
   * @throws {ValidationError} Se parâmetros inválidos
   */
  calculateTotalPrice({ room, dateRange, guestsCount, services = [], options = {} }) {
    const startTime = Date.now();
    
    try {
      // 1. Validar parâmetros
      this._validateParams({ room, dateRange, guestsCount, services });

      // 2. Calcular preço do quarto
      const roomTotal = this._calculateRoomPrice(room, dateRange);

      // 3. Calcular preço dos serviços
      const serviceBreakdown = this._calculateServicesPrice(services, dateRange, guestsCount);
      const servicesTotal = serviceBreakdown.total;

      // 4. Calcular subtotal (quarto + serviços)
      const subtotal = roomTotal.add(servicesTotal);

      // 5. Aplicar descontos
      let discountResult = { discounts: [], totalAfterDiscounts: subtotal };
      if (options.applyDiscounts !== false) {
        discountResult = this._applyDiscounts({
          room,
          dateRange,
          guestsCount,
          services,
          roomTotal,
          servicesTotal,
          subtotal,
          options
        });
      }

      // 6. Aplicar impostos
      let taxResult = { taxes: {}, totalAfterTaxes: discountResult.totalAfterDiscounts };
      if (options.applyTaxes !== false) {
        taxResult = this._applyTaxes(discountResult.totalAfterDiscounts, dateRange);
      }

      // 7. Calcular total final
      const total = taxResult.totalAfterTaxes;

      // 8. Preparar breakdown
      const breakdown = new PriceBreakdown({
        room,
        dateRange,
        guestsCount,
        services: serviceBreakdown.items,
        discounts: discountResult.discounts,
        taxes: taxResult.taxes,
        subtotal,
        total
      });

      // 9. Logging estruturado
      const duration = Date.now() - startTime;
      this.logger.info('Price calculation completed', {
        roomId: room.id,
        nights: dateRange.getNights(),
        guests: guestsCount,
        subtotal: subtotal.amount,
        total: total.amount,
        discounts: discountResult.discounts.length,
        duration: `${duration}ms`
      });

      return breakdown;

    } catch (error) {
      this.logger.error('Error calculating price:', {
        error: error.message,
        stack: error.stack,
        roomId: room?.id
      });
      throw error;
    }
  }

  /**
   * Valida parâmetros de entrada
   * @private
   */
  _validateParams({ room, dateRange, guestsCount, services }) {
    if (!room) {
      throw new ValidationError('Room é obrigatório');
    }

    if (!dateRange) {
      throw new ValidationError('DateRange é obrigatório');
    }

    if (!guestsCount || guestsCount < 1) {
      throw new ValidationError('Número de hóspedes inválido');
    }

    if (!Array.isArray(services)) {
      throw new ValidationError('Services deve ser um array');
    }
  }

  /**
   * Calcula preço do quarto
   * @private
   */
  _calculateRoomPrice(room, dateRange) {
    const nights = dateRange.getNights();
    return room.pricePerNight.multiply(nights);
  }

  /**
   * Calcula preço dos serviços
   * @private
   */
  _calculateServicesPrice(services, dateRange, guestsCount) {
    const items = [];
    let total = zeroMoney();

    for (const service of services) {
      // Por padrão, quantidade = 1
      // Em uma implementação mais avançada, isso viria dos parâmetros
      const quantity = 1;

      const subtotal = service.calculatePrice({
        nights: dateRange.getNights(),
        guests: guestsCount,
        quantity
      });

      items.push(new ServiceBreakdownItem(
        service,
        quantity,
        dateRange.getNights(),
        guestsCount,
        subtotal
      ));

      total = total.add(subtotal);
    }

    return { items, total };
  }

  /**
   * Aplica descontos
   * @private
   */
  _applyDiscounts({ room, dateRange, guestsCount, services, roomTotal, servicesTotal, subtotal, options }) {
    const discounts = [];
    let currentTotal = subtotal;

    // 1. Desconto por volume (quantidade de serviços)
    if (services.length >= 3) {
      const applicableDiscount = this.discountConfig.volumeDiscounts
        .sort((a, b) => b.minItems - a.minItems)
        .find(d => services.length >= d.minItems);

      if (applicableDiscount) {
        const discountAmount = currentTotal.multiply(applicableDiscount.discount);
        discounts.push({
          type: 'VOLUME',
          description: `Desconto por volume (${services.length} serviços)`,
          rate: applicableDiscount.discount * 100,
          amount: discountAmount.amount,
          amountFormatted: discountAmount.toString()
        });
        currentTotal = currentTotal.subtract(discountAmount);
      }
    }

    // 2. Desconto sazonal
    if (options.checkInDate) {
      const month = options.checkInDate.getMonth() + 1;
      const seasonalDiscount = this.discountConfig.seasonalDiscounts
        .find(d => d.month === month);

      if (seasonalDiscount) {
        const discountAmount = currentTotal.multiply(seasonalDiscount.discount);
        discounts.push({
          type: 'SEASONAL',
          description: `Promoção sazonal de ${this._getMonthName(month)}`,
          rate: seasonalDiscount.discount * 100,
          amount: discountAmount.amount,
          amountFormatted: discountAmount.toString()
        });
        currentTotal = currentTotal.subtract(discountAmount);
      }
    }

    // 3. Desconto early bird (reserva com antecedência)
    if (options.checkInDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysUntilCheckIn = Math.ceil((options.checkInDate - today) / (1000 * 60 * 60 * 24));

      if (daysUntilCheckIn >= 30) {
        const discountAmount = currentTotal.multiply(this.discountConfig.earlyBirdDiscount);
        discounts.push({
          type: 'EARLY_BIRD',
          description: 'Desconto early bird (30+ dias de antecedência)',
          rate: this.discountConfig.earlyBirdDiscount * 100,
          amount: discountAmount.amount,
          amountFormatted: discountAmount.toString()
        });
        currentTotal = currentTotal.subtract(discountAmount);
      } else if (daysUntilCheckIn <= 3) {
        const discountAmount = currentTotal.multiply(this.discountConfig.lastMinuteDiscount);
        discounts.push({
          type: 'LAST_MINUTE',
          description: 'Desconto last minute',
          rate: this.discountConfig.lastMinuteDiscount * 100,
          amount: discountAmount.amount,
          amountFormatted: discountAmount.toString()
        });
        currentTotal = currentTotal.subtract(discountAmount);
      }
    }

    // 4. Limitar desconto máximo
    const totalDiscountAmount = discounts.reduce((sum, d) => sum + d.amount, 0);
    const maxDiscount = subtotal.multiply(this.discountConfig.maxTotalDiscount);

    if (totalDiscountAmount > maxDiscount.amount) {
      // Ajustar descontos proporcionalmente
      const factor = maxDiscount.amount / totalDiscountAmount;
      
      discounts.forEach(d => {
        d.amount = d.amount * factor;
        d.amountFormatted = new Money(d.amount).toString();
        d.description += ' (ajustado ao limite máximo)';
      });

      currentTotal = subtotal.subtract(maxDiscount);
    }

    return { discounts, totalAfterDiscounts: currentTotal };
  }

  /**
   * Aplica impostos
   * @private
   */
  _applyTaxes(subtotal, dateRange) {
    const taxes = {};

    // Taxa de serviço (percentual)
    if (this.taxConfig.serviceTax > 0) {
      const amount = subtotal.multiply(this.taxConfig.serviceTax);
      taxes.serviceTax = {
        rate: this.taxConfig.serviceTax * 100,
        amount: amount.amount,
        amountFormatted: amount.toString()
      };
    }

    // Taxa municipal (percentual)
    if (this.taxConfig.cityTax > 0) {
      const amount = subtotal.multiply(this.taxConfig.cityTax);
      taxes.cityTax = {
        rate: this.taxConfig.cityTax * 100,
        amount: amount.amount,
        amountFormatted: amount.toString()
      };
    }

    // IVA (percentual)
    if (this.taxConfig.vat > 0) {
      const amount = subtotal.multiply(this.taxConfig.vat);
      taxes.vat = {
        rate: this.taxConfig.vat * 100,
        amount: amount.amount,
        amountFormatted: amount.toString()
      };
    }

    // Taxa turística (fixa por noite)
    if (this.taxConfig.touristTax > 0) {
      const nights = dateRange.getNights();
      const amount = new Money(this.taxConfig.touristTax * nights);
      taxes.touristTax = {
        rate: `R$ ${this.taxConfig.touristTax.toFixed(2)}/noite`,
        amount: amount.amount,
        amountFormatted: amount.toString()
      };
    }

    // Calcular total de impostos
    let totalTaxes = zeroMoney();
    for (const tax of Object.values(taxes)) {
      totalTaxes = totalTaxes.add(new Money(tax.amount));
    }

    const totalAfterTaxes = subtotal.add(totalTaxes);

    return {
      taxes,
      totalAfterTaxes
    };
  }

  /**
   * Retorna nome do mês
   * @private
   */
  _getMonthName(month) {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
  }

  /**
   * Versão simplificada para cálculo rápido
   */
  quickCalculate(room, nights, guestsCount) {
    const roomTotal = room.pricePerNight.multiply(nights);
    return {
      roomTotal: roomTotal.amount,
      roomTotalFormatted: roomTotal.toString()
    };
  }
}