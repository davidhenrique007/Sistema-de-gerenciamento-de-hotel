// ============================================
// USE CASE: CalculateServicesPriceUseCase
// ============================================
// Responsabilidade: Calcular preço total dos serviços
// com aplicação de descontos e promoções
// ============================================

// ============================================
// IMPORTAÇÕES
// ============================================
import { AppError, ValidationError, NotFoundError } from '../../../../shared/utils/errorUtils.js';
import { Money, zeroMoney, sumMoney } from '../../../domain/value-objects/Money.js';
import { ServiceType } from '../../../domain/entities/Service.js';

// ============================================
// CONSTANTES - REGRAS DE DESCONTO
// ============================================

/**
 * Configurações de descontos e promoções
 */
const DISCOUNT_CONFIG = {
  // Desconto por volume (múltiplos serviços)
  volumeDiscounts: [
    { minItems: 3, discount: 0.10 }, // 10% para 3+ serviços
    { minItems: 5, discount: 0.15 }, // 15% para 5+ serviços
    { minItems: 10, discount: 0.20 } // 20% para 10+ serviços
  ],
  
  // Descontos sazonais (exemplo)
  seasonalDiscounts: [
    { month: 12, discount: 0.15 }, // Natal: 15%
    { month: 1, discount: 0.10 },  // Ano Novo: 10%
    { month: 7, discount: 0.10 }   // Julho: 10%
  ],

  // Descontos por categoria
  categoryDiscounts: {
    wellness: 0.05,  // 5% para serviços de bem-estar
    food: 0.00       // Sem desconto
  },

  // Limite máximo de desconto acumulado
  maxTotalDiscount: 0.30 // 30% máximo
};

// ============================================
// DTOs - DATA TRANSFER OBJECTS
// ============================================

/**
 * DTO para item de serviço no cálculo
 */
class ServiceCalculationItemDTO {
  constructor(service, quantity, nights, guests, subtotal, discount = null) {
    this.id = service.id;
    this.name = service.name;
    this.type = service.type;
    this.typeLabel = this._getTypeLabel(service.type);
    this.price = service.price.amount;
    this.priceFormatted = service.price.toString();
    this.quantity = quantity;
    this.nights = nights;
    this.guests = guests;
    this.subtotal = subtotal.amount;
    this.subtotalFormatted = subtotal.toString();
    
    if (discount) {
      this.discount = {
        amount: discount.amount,
        formatted: discount.toString(),
        percentage: (discount.amount / subtotal.amount) * 100
      };
    }
  }

  _getTypeLabel(type) {
    const labels = {
      [ServiceType.PER_NIGHT]: 'Por noite',
      [ServiceType.PER_STAY]: 'Por estadia',
      [ServiceType.PER_PERSON]: 'Por pessoa',
      [ServiceType.PER_PERSON_NIGHT]: 'Por pessoa/noite'
    };
    return labels[type] || type;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      typeLabel: this.typeLabel,
      price: this.price,
      priceFormatted: this.priceFormatted,
      quantity: this.quantity,
      nights: this.nights,
      guests: this.guests,
      subtotal: this.subtotal,
      subtotalFormatted: this.subtotalFormatted,
      discount: this.discount
    };
  }
}

/**
 * DTO para breakdown completo de serviços
 */
class ServicesBreakdownDTO {
  constructor({ items, subtotal, discounts, total, metadata = {} }) {
    this.items = items.map(item => item.toJSON());
    this.subtotal = {
      amount: subtotal.amount,
      formatted: subtotal.toString()
    };
    this.discounts = discounts.map(d => ({
      type: d.type,
      description: d.description,
      amount: d.amount.amount,
      formatted: d.amount.toString(),
      percentage: d.percentage
    }));
    this.total = {
      amount: total.amount,
      formatted: total.toString()
    };
    this.savings = {
      amount: subtotal.amount - total.amount,
      formatted: new Money(subtotal.amount - total.amount).toString(),
      percentage: ((subtotal.amount - total.amount) / subtotal.amount) * 100
    };
    this.metadata = metadata;
  }

  toJSON() {
    return {
      items: this.items,
      subtotal: this.subtotal,
      discounts: this.discounts,
      total: this.total,
      savings: this.savings,
      metadata: this.metadata
    };
  }
}

// ============================================
// USE CASE PRINCIPAL
// ============================================

export class CalculateServicesPriceUseCase {
  /**
   * @param {Object} dependencies - Dependências injetadas
   * @param {ServiceRepository} dependencies.serviceRepository - Repositório de serviços
   * @param {Logger} dependencies.logger - Logger (opcional)
   */
  constructor({ serviceRepository, logger = console }) {
    this.serviceRepository = serviceRepository;
    this.logger = logger;
  }

  /**
   * Executa o caso de uso
   * @param {Object} params - Parâmetros de execução
   * @param {Array<Object>} params.services - Lista de serviços selecionados
   * @param {string|number} params.services[].id - ID do serviço
   * @param {number} params.services[].quantity - Quantidade (default: 1)
   * @param {number} params.nights - Número de noites
   * @param {number} params.guests - Número de hóspedes
   * @param {Object} params.options - Opções adicionais
   * @param {Date} params.options.checkIn - Data de check-in (para promoções sazonais)
   * @param {boolean} params.options.applyDiscounts - Aplicar descontos (default: true)
   * @returns {Promise<ServicesBreakdownDTO>} Breakdown detalhado
   */
  async execute({ services, nights, guests, options = {} }) {
    try {
      // 1. Validar parâmetros
      this._validateParams({ services, nights, guests });

      // 2. Buscar serviços completos
      const serviceItems = await this._fetchServices(services);

      // 3. Calcular subtotal (sem descontos)
      const calculationItems = [];
      let subtotal = zeroMoney();

      for (const { service, quantity } of serviceItems) {
        const itemSubtotal = this._calculateServiceSubtotal(service, quantity, nights, guests);
        
        calculationItems.push({
          service,
          quantity,
          nights,
          guests,
          subtotal: itemSubtotal
        });

        subtotal = subtotal.add(itemSubtotal);
      }

      // 4. Aplicar descontos (se solicitado)
      let discounts = [];
      let total = subtotal;

      if (options.applyDiscounts !== false) {
        const discountResult = await this._applyDiscounts(calculationItems, subtotal, options);
        discounts = discountResult.discounts;
        total = discountResult.total;
      }

      // 5. Preparar metadados
      const metadata = {
        nights,
        guests,
        serviceCount: services.length,
        uniqueServices: serviceItems.length,
        hasDiscounts: discounts.length > 0,
        checkIn: options.checkIn ? options.checkIn.toISOString().split('T')[0] : null
      };

      // 6. Criar DTOs para cada item
      const itemDTOs = calculationItems.map(item => 
        new ServiceCalculationItemDTO(
          item.service,
          item.quantity,
          item.nights,
          item.guests,
          item.subtotal
        )
      );

      // 7. Log do cálculo
      this.logger.info(`Services price calculated`, {
        items: services.length,
        subtotal: subtotal.amount,
        discounts: discounts.length,
        total: total.amount,
        savings: subtotal.amount - total.amount
      });

      // 8. Retornar breakdown
      return new ServicesBreakdownDTO({
        items: itemDTOs,
        subtotal,
        discounts,
        total,
        metadata
      });
    } catch (error) {
      this.logger.error('Error calculating services price:', error);
      throw error;
    }
  }

  /**
   * Valida parâmetros de entrada
   * @private
   */
  _validateParams({ services, nights, guests }) {
    if (!services || !Array.isArray(services) || services.length === 0) {
      throw new ValidationError('Lista de serviços é obrigatória', {
        field: 'services'
      });
    }

    for (const item of services) {
      if (!item.id) {
        throw new ValidationError('ID do serviço é obrigatório', {
          field: 'services[].id'
        });
      }

      if (item.quantity !== undefined && (typeof item.quantity !== 'number' || item.quantity < 1)) {
        throw new ValidationError('Quantidade deve ser um número positivo', {
          field: 'services[].quantity',
          receivedValue: item.quantity
        });
      }
    }

    if (!nights || typeof nights !== 'number' || nights < 1) {
      throw new ValidationError('Número de noites deve ser maior que zero', {
        field: 'nights',
        receivedValue: nights
      });
    }

    if (!guests || typeof guests !== 'number' || guests < 1) {
      throw new ValidationError('Número de hóspedes deve ser maior que zero', {
        field: 'guests',
        receivedValue: guests
      });
    }
  }

  /**
   * Busca serviços completos a partir dos IDs
   * @private
   */
  async _fetchServices(services) {
    const result = [];

    for (const item of services) {
      const service = await this.serviceRepository.findById(item.id);
      
      if (!service) {
        throw new NotFoundError(`Serviço com ID ${item.id} não encontrado`, {
          serviceId: item.id,
          entity: 'Service'
        });
      }

      result.push({
        service,
        quantity: item.quantity || 1
      });
    }

    return result;
  }

  /**
   * Calcula subtotal para um serviço
   * @private
   */
  _calculateServiceSubtotal(service, quantity, nights, guests) {
    return service.calculatePrice({
      nights,
      guests,
      quantity
    });
  }

  /**
   * Aplica descontos aos serviços
   * @private
   */
  async _applyDiscounts(items, subtotal, options) {
    const discounts = [];
    let total = subtotal;

    // 1. Desconto por volume (quantidade de serviços)
    const volumeDiscount = this._calculateVolumeDiscount(items.length, subtotal);
    if (volumeDiscount) {
      discounts.push(volumeDiscount);
      total = total.subtract(volumeDiscount.amount);
    }

    // 2. Desconto sazonal (baseado na data)
    if (options.checkIn) {
      const seasonalDiscount = this._calculateSeasonalDiscount(options.checkIn, total);
      if (seasonalDiscount) {
        discounts.push(seasonalDiscount);
        total = total.subtract(seasonalDiscount.amount);
      }
    }

    // 3. Desconto por categoria
    const categoryDiscount = await this._calculateCategoryDiscounts(items, total);
    if (categoryDiscount) {
      discounts.push(categoryDiscount);
      total = total.subtract(categoryDiscount.amount);
    }

    // 4. Limitar desconto total máximo
    const totalDiscountAmount = discounts.reduce((sum, d) => sum + d.amount.amount, 0);
    const maxDiscount = subtotal.multiply(DISCOUNT_CONFIG.maxTotalDiscount);

    if (totalDiscountAmount > maxDiscount.amount) {
      // Ajustar descontos proporcionalmente
      const factor = maxDiscount.amount / totalDiscountAmount;
      
      discounts.forEach(d => {
        d.amount = new Money(d.amount.amount * factor);
        d.percentage = (d.amount.amount / subtotal.amount) * 100;
        d.description += ' (ajustado ao limite máximo)';
      });

      total = subtotal.subtract(maxDiscount);
    }

    return { discounts, total };
  }

  /**
   * Calcula desconto por volume
   * @private
   */
  _calculateVolumeDiscount(itemCount, subtotal) {
    const applicableDiscount = DISCOUNT_CONFIG.volumeDiscounts
      .sort((a, b) => b.minItems - a.minItems)
      .find(d => itemCount >= d.minItems);

    if (!applicableDiscount) {
      return null;
    }

    const discountAmount = subtotal.multiply(applicableDiscount.discount);

    return {
      type: 'VOLUME',
      description: `Desconto por volume (${itemCount} serviços)`,
      amount: discountAmount,
      percentage: applicableDiscount.discount * 100
    };
  }

  /**
   * Calcula desconto sazonal
   * @private
   */
  _calculateSeasonalDiscount(checkIn, subtotal) {
    const month = checkIn.getMonth() + 1; // Janeiro = 1
    
    const applicableDiscount = DISCOUNT_CONFIG.seasonalDiscounts
      .find(d => d.month === month);

    if (!applicableDiscount) {
      return null;
    }

    const discountAmount = subtotal.multiply(applicableDiscount.discount);

    return {
      type: 'SEASONAL',
      description: `Promoção sazonal (${this._getMonthName(month)})`,
      amount: discountAmount,
      percentage: applicableDiscount.discount * 100
    };
  }

  /**
   * Calcula descontos por categoria
   * @private
   */
  async _calculateCategoryDiscounts(items, subtotal) {
    let totalDiscount = zeroMoney();
    const appliedCategories = [];

    // Agrupar itens por categoria (precisa inferir categoria)
    for (const item of items) {
      // Importar ListServicesUseCase para usar a inferência
      // Por simplicidade, vamos usar uma lógica simplificada aqui
      const category = this._inferCategory(item.service);
      
      const discountRate = DISCOUNT_CONFIG.categoryDiscounts[category];
      
      if (discountRate && discountRate > 0) {
        const itemDiscount = item.subtotal.multiply(discountRate);
        totalDiscount = totalDiscount.add(itemDiscount);
        appliedCategories.push(category);
      }
    }

    if (totalDiscount.amount === 0) {
      return null;
    }

    return {
      type: 'CATEGORY',
      description: `Desconto em categorias: ${[...new Set(appliedCategories)].join(', ')}`,
      amount: totalDiscount,
      percentage: (totalDiscount.amount / subtotal.amount) * 100
    };
  }

  /**
   * Infere categoria do serviço (simplificado)
   * @private
   */
  _inferCategory(service) {
    const name = service.name.toLowerCase();
    
    if (name.includes('spa') || name.includes('massagem')) return 'wellness';
    if (name.includes('café') || name.includes('restaurante')) return 'food';
    
    return 'other';
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
   * Versão simplificada para calcular apenas um serviço
   */
  async calculateSingle(serviceId, quantity, nights, guests) {
    return this.execute({
      services: [{ id: serviceId, quantity }],
      nights,
      guests
    });
  }

  /**
   * Calcula preço com desconto personalizado
   */
  async calculateWithCustomDiscount(services, nights, guests, customDiscountRate) {
    const result = await this.execute({
      services,
      nights,
      guests,
      options: { applyDiscounts: false }
    });

    if (customDiscountRate > 0) {
      const discountAmount = result.subtotal.amount * (customDiscountRate / 100);
      const discountMoney = new Money(discountAmount);
      
      result.discounts.push({
        type: 'CUSTOM',
        description: 'Desconto personalizado',
        amount: discountMoney,
        percentage: customDiscountRate
      });

      result.total.amount = result.subtotal.amount - discountAmount;
      result.total.formatted = new Money(result.total.amount).toString();
    }

    return result;
  }
}