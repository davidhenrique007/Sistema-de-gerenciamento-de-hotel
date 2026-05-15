// ============================================
// USE CASE: CalculatePriceUseCase
// ============================================
// Responsabilidade: Calcular o total da reserva
// com breakdown detalhado de preços
// ============================================

// ============================================
// IMPORTAÇÕES
// ============================================
import { ValidationError, NotFoundError } from '../../../../shared/utils/errorUtils.js';
import { DateRange } from '../../../domain/value-objects/DateRange.js';
import { Money, zeroMoney, sumMoney } from '../../../domain/value-objects/Money.js';
import { ServiceType } from '../../../domain/entities/Service.js';

// ============================================
// CONSTANTES
// ============================================

// Configurações de impostos e taxas
const TAX_CONFIG = {
  serviceTax: 0.10, // 10% de taxa de serviço
  cityTax: 0.05,    // 5% de taxa municipal
  vat: 0.23         // 23% de IVA (exemplo europeu)
};

// ============================================
// DTOs - DATA TRANSFER OBJECTS
// ============================================

/**
 * DTO para item de serviço no breakdown
 */
class ServiceItemDTO {
  constructor(service, quantity, subtotal) {
    this.id = service.id;
    this.name = service.name;
    this.type = service.type;
    this.price = service.price.amount;
    this.priceFormatted = service.price.toString();
    this.quantity = quantity;
    this.subtotal = subtotal.amount;
    this.subtotalFormatted = subtotal.toString();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      price: this.price,
      priceFormatted: this.priceFormatted,
      quantity: this.quantity,
      subtotal: this.subtotal,
      subtotalFormatted: this.subtotalFormatted
    };
  }
}

/**
 * DTO para breakdown completo de preços
 */
class PriceBreakdownDTO {
  constructor({
    room,
    dateRange,
    services = [],
    guestsCount,
    applyTaxes = true
  }) {
    // Dados básicos
    this.roomId = room.id;
    this.roomNumber = room.number;
    this.roomType = room.type;
    this.guestsCount = guestsCount;
    this.nights = dateRange.getNights();
    this.checkIn = dateRange.checkIn.toISOString().split('T')[0];
    this.checkOut = dateRange.checkOut.toISOString().split('T')[0];

    // Calcular breakdown
    this._calculateBreakdown(room, dateRange, services, guestsCount, applyTaxes);
  }

  /**
   * Calcula todos os componentes do preço
   * @private
   */
  _calculateBreakdown(room, dateRange, services, guestsCount, applyTaxes) {
    // 1. Preço do quarto
    this.roomPrice = {
      perNight: room.pricePerNight.amount,
      perNightFormatted: room.pricePerNight.toString(),
      subtotal: room.pricePerNight.multiply(this.nights).amount,
      subtotalFormatted: room.pricePerNight.multiply(this.nights).toString()
    };

    // 2. Preço dos serviços
    this.services = [];
    let servicesTotal = zeroMoney();

    for (const service of services) {
      const quantity = 1; // Por enquanto, depois podemos permitir múltiplas quantidades
      
      const subtotal = service.calculatePrice({
        nights: this.nights,
        guests: guestsCount,
        quantity
      });

      this.services.push(new ServiceItemDTO(service, quantity, subtotal));
      servicesTotal = servicesTotal.add(subtotal);
    }

    this.servicesTotal = {
      amount: servicesTotal.amount,
      formatted: servicesTotal.toString()
    };

    // 3. Subtotal (quarto + serviços)
    const roomTotal = room.pricePerNight.multiply(this.nights);
    const subtotal = roomTotal.add(servicesTotal);
    
    this.subtotal = {
      amount: subtotal.amount,
      formatted: subtotal.toString()
    };

    // 4. Impostos e taxas (opcional)
    if (applyTaxes) {
      this.taxes = this._calculateTaxes(subtotal);
      
      // 5. Total com impostos
      const totalWithTaxes = this._applyTaxes(subtotal, this.taxes);
      
      this.total = {
        amount: totalWithTaxes.amount,
        formatted: totalWithTaxes.toString(),
        withTaxes: true
      };
    } else {
      this.taxes = {
        serviceTax: { amount: 0, formatted: zeroMoney().toString() },
        cityTax: { amount: 0, formatted: zeroMoney().toString() },
        vat: { amount: 0, formatted: zeroMoney().toString() },
        total: { amount: 0, formatted: zeroMoney().toString() }
      };
      
      this.total = {
        amount: subtotal.amount,
        formatted: subtotal.toString(),
        withTaxes: false
      };
    }

    // 6. Preço médio por noite
    this.averagePerNight = {
      amount: this.total.amount / this.nights,
      formatted: new Money(this.total.amount / this.nights).toString()
    };
  }

  /**
   * Calcula impostos sobre o subtotal
   * @private
   */
  _calculateTaxes(subtotal) {
    const serviceTax = subtotal.multiply(TAX_CONFIG.serviceTax);
    const cityTax = subtotal.multiply(TAX_CONFIG.cityTax);
    const vat = subtotal.multiply(TAX_CONFIG.vat);

    const totalTaxes = serviceTax.add(cityTax).add(vat);

    return {
      serviceTax: {
        rate: TAX_CONFIG.serviceTax * 100,
        amount: serviceTax.amount,
        formatted: serviceTax.toString()
      },
      cityTax: {
        rate: TAX_CONFIG.cityTax * 100,
        amount: cityTax.amount,
        formatted: cityTax.toString()
      },
      vat: {
        rate: TAX_CONFIG.vat * 100,
        amount: vat.amount,
        formatted: vat.toString()
      },
      total: {
        amount: totalTaxes.amount,
        formatted: totalTaxes.toString()
      }
    };
  }

  /**
   * Aplica impostos ao subtotal
   * @private
   */
  _applyTaxes(subtotal, taxes) {
    const serviceTaxMoney = new Money(taxes.serviceTax.amount);
    const cityTaxMoney = new Money(taxes.cityTax.amount);
    const vatMoney = new Money(taxes.vat.amount);

    return subtotal.add(serviceTaxMoney).add(cityTaxMoney).add(vatMoney);
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
      roomPrice: this.roomPrice,
      services: this.services.map(s => s.toJSON()),
      servicesTotal: this.servicesTotal,
      subtotal: this.subtotal,
      taxes: this.taxes,
      total: this.total,
      averagePerNight: this.averagePerNight
    };
  }
}

// ============================================
// USE CASE PRINCIPAL
// ============================================

export class CalculatePriceUseCase {
  /**
   * @param {Object} dependencies - Dependências injetadas
   * @param {RoomRepository} dependencies.roomRepository - Repositório de quartos
   * @param {ServiceRepository} dependencies.serviceRepository - Repositório de serviços
   * @param {Logger} dependencies.logger - Logger (opcional)
   */
  constructor({ roomRepository, serviceRepository, logger = console }) {
    this.roomRepository = roomRepository;
    this.serviceRepository = serviceRepository;
    this.logger = logger;
  }

  /**
   * Executa o caso de uso
   * @param {Object} params - Parâmetros de execução
   * @param {string|number} params.roomId - ID do quarto
   * @param {DateRange} params.dateRange - Período da reserva
   * @param {number} params.guestsCount - Número de hóspedes
   * @param {Array<string|number>} params.serviceIds - IDs dos serviços selecionados
   * @param {Object} params.options - Opções adicionais
   * @param {boolean} params.options.applyTaxes - Se deve aplicar impostos (default: true)
   * @returns {Promise<PriceBreakdownDTO>} Breakdown detalhado de preços
   */
  async execute({ roomId, dateRange, guestsCount, serviceIds = [], options = {} }) {
    try {
      // 1. Validar parâmetros
      this._validateParams({ roomId, dateRange, guestsCount, serviceIds });

      // 2. Buscar quarto
      const room = await this.roomRepository.findById(roomId);
      
      if (!room) {
        throw new NotFoundError('Quarto não encontrado', {
          roomId,
          entity: 'Room'
        });
      }

      // 3. Validar capacidade do quarto
      if (!room.canAccommodate(guestsCount)) {
        throw new ValidationError('Quarto não comporta o número de hóspedes', {
          roomId: room.id,
          roomCapacity: room.capacity,
          requestedGuests: guestsCount
        });
      }

      // 4. Buscar serviços
      const services = [];
      for (const serviceId of serviceIds) {
        const service = await this.serviceRepository.findById(serviceId);
        
        if (!service) {
          throw new NotFoundError(`Serviço com ID ${serviceId} não encontrado`, {
            serviceId,
            entity: 'Service'
          });
        }
        
        services.push(service);
      }

      // 5. Calcular breakdown
      const breakdown = new PriceBreakdownDTO({
        room,
        dateRange,
        services,
        guestsCount,
        applyTaxes: options.applyTaxes !== false
      });

      // 6. Log do cálculo
      this.logger.info(`Price calculated for room ${room.number}`, {
        roomId: room.id,
        nights: breakdown.nights,
        guests: guestsCount,
        total: breakdown.total.amount
      });

      return breakdown;
    } catch (error) {
      this.logger.error('Error calculating price:', error);
      throw error;
    }
  }

  /**
   * Valida parâmetros de entrada
   * @private
   */
  _validateParams({ roomId, dateRange, guestsCount, serviceIds }) {
    if (!roomId) {
      throw new ValidationError('ID do quarto é obrigatório', {
        field: 'roomId'
      });
    }

    if (!dateRange) {
      throw new ValidationError('Período da reserva é obrigatório', {
        field: 'dateRange'
      });
    }

    if (!(dateRange instanceof DateRange)) {
      throw new ValidationError('dateRange deve ser uma instância de DateRange', {
        receivedType: typeof dateRange
      });
    }

    if (!dateRange.isValid()) {
      throw new ValidationError('Período de reserva inválido', {
        nights: dateRange.getNights()
      });
    }

    if (!guestsCount || typeof guestsCount !== 'number' || guestsCount < 1) {
      throw new ValidationError('Número de hóspedes deve ser maior que zero', {
        field: 'guestsCount',
        receivedValue: guestsCount
      });
    }

    if (serviceIds && !Array.isArray(serviceIds)) {
      throw new ValidationError('serviceIds deve ser um array', {
        receivedType: typeof serviceIds
      });
    }
  }

  /**
   * Versão simplificada para cálculo rápido
   */
  async quickCalculate(roomId, checkIn, checkOut, guestsCount) {
    const dateRange = new DateRange(checkIn, checkOut);
    
    return this.execute({
      roomId,
      dateRange,
      guestsCount,
      serviceIds: []
    });
  }

  /**
   * Calcula preço com serviços pré-carregados (otimizado)
   */
  async calculateWithServices(room, dateRange, guestsCount, services) {
    const breakdown = new PriceBreakdownDTO({
      room,
      dateRange,
      services,
      guestsCount,
      applyTaxes: true
    });

    return breakdown;
  }
}