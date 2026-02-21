// ============================================
// USE CASE: ListServicesUseCase
// ============================================
// Responsabilidade: Listar serviços disponíveis
// organizados por categoria para a UI
// ============================================

// ============================================
// IMPORTAÇÕES
// ============================================
import { ValidationError } from '../../../../shared/utils/errorUtils.js';
import { ServiceType } from '../../../domain/entities/Service.js';
import { Money } from '../../../domain/value-objects/Money.js';

// ============================================
// CONSTANTES - CATEGORIAS DE SERVIÇOS
// ============================================

export const ServiceCategory = {
  FOOD: 'food',           // Alimentação
  BEVERAGE: 'beverage',   // Bebidas
  WELLNESS: 'wellness',   // Bem-estar (spa, massagem)
  TRANSPORT: 'transport', // Transporte
  ENTERTAINMENT: 'entertainment', // Entretenimento
  BUSINESS: 'business',   // Negócios
  OTHER: 'other'          // Outros
};

/**
 * Mapeamento de categorias para metadados
 */
const CategoryMetadata = {
  [ServiceCategory.FOOD]: {
    label: 'Alimentação',
    icon: 'restaurant',
    description: 'Opções de refeições e alimentação',
    order: 1
  },
  [ServiceCategory.BEVERAGE]: {
    label: 'Bebidas',
    icon: 'wine-bar',
    description: 'Bebidas e coquetéis',
    order: 2
  },
  [ServiceCategory.WELLNESS]: {
    label: 'Bem-estar',
    icon: 'spa',
    description: 'Spa, massagem e relaxamento',
    order: 3
  },
  [ServiceCategory.TRANSPORT]: {
    label: 'Transporte',
    icon: 'car',
    description: 'Translado e transporte',
    order: 4
  },
  [ServiceCategory.ENTERTAINMENT]: {
    label: 'Entretenimento',
    icon: 'movie',
    description: 'Atividades de lazer',
    order: 5
  },
  [ServiceCategory.BUSINESS]: {
    label: 'Negócios',
    icon: 'briefcase',
    description: 'Serviços para empresas',
    order: 6
  },
  [ServiceCategory.OTHER]: {
    label: 'Outros',
    icon: 'more-horiz',
    description: 'Outros serviços',
    order: 7
  }
};

// ============================================
// DTOs - DATA TRANSFER OBJECTS
// ============================================

/**
 * DTO para item de serviço na listagem
 */
class ServiceItemDTO {
  constructor(service) {
    this.id = service.id;
    this.name = service.name;
    this.description = service.description;
    this.type = service.type;
    this.typeLabel = this._getTypeLabel(service.type);
    this.category = this._inferCategory(service);
    this.price = service.price.amount;
    this.priceFormatted = service.price.toString();
    this.pricePerNight = service.type === ServiceType.PER_NIGHT || 
                        service.type === ServiceType.PER_PERSON_NIGHT;
    this.perPerson = service.type === ServiceType.PER_PERSON || 
                    service.type === ServiceType.PER_PERSON_NIGHT;
    this.isOptional = service.isOptional;
    this.maxQuantity = service.maxQuantity;
    this.icon = this._getIcon(service);
  }

  /**
   * Retorna label amigável para o tipo
   * @private
   */
  _getTypeLabel(type) {
    const labels = {
      [ServiceType.PER_NIGHT]: 'Por noite',
      [ServiceType.PER_STAY]: 'Por estadia',
      [ServiceType.PER_PERSON]: 'Por pessoa',
      [ServiceType.PER_PERSON_NIGHT]: 'Por pessoa/noite'
    };
    return labels[type] || type;
  }

  /**
   * Infere categoria baseado no nome e descrição
   * @private
   */
  _inferCategory(service) {
    const name = service.name.toLowerCase();
    const desc = (service.description || '').toLowerCase();

    // Regras de inferência
    if (name.includes('café') || name.includes('restaurante') || 
        name.includes('jantar') || name.includes('almoço') ||
        desc.includes('comida') || desc.includes('refeição')) {
      return ServiceCategory.FOOD;
    }

    if (name.includes('vinho') || name.includes('cerveja') || 
        name.includes('drink') || name.includes('coquetel') ||
        name.includes('água') || name.includes('refrigerante')) {
      return ServiceCategory.BEVERAGE;
    }

    if (name.includes('spa') || name.includes('massagem') || 
        name.includes('sauna') || name.includes('academia') ||
        name.includes('yoga')) {
      return ServiceCategory.WELLNESS;
    }

    if (name.includes('translado') || name.includes('taxi') || 
        name.includes('transfer') || name.includes('estacionamento')) {
      return ServiceCategory.TRANSPORT;
    }

    if (name.includes('cinema') || name.includes('show') || 
        name.includes('passeio') || name.includes('tour')) {
      return ServiceCategory.ENTERTAINMENT;
    }

    if (name.includes('escritório') || name.includes('reunião') || 
        name.includes('sala') || name.includes('business')) {
      return ServiceCategory.BUSINESS;
    }

    return ServiceCategory.OTHER;
  }

  /**
   * Retorna ícone baseado na categoria
   * @private
   */
  _getIcon(service) {
    const category = this.category;
    
    const iconMap = {
      [ServiceCategory.FOOD]: 'restaurant',
      [ServiceCategory.BEVERAGE]: 'local-drink',
      [ServiceCategory.WELLNESS]: 'spa',
      [ServiceCategory.TRANSPORT]: 'airport-shuttle',
      [ServiceCategory.ENTERTAINMENT]: 'theaters',
      [ServiceCategory.BUSINESS]: 'business-center',
      [ServiceCategory.OTHER]: 'room-service'
    };

    return iconMap[category] || 'room-service';
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      typeLabel: this.typeLabel,
      category: this.category,
      price: this.price,
      priceFormatted: this.priceFormatted,
      pricePerNight: this.pricePerNight,
      perPerson: this.perPerson,
      isOptional: this.isOptional,
      maxQuantity: this.maxQuantity,
      icon: this.icon
    };
  }
}

/**
 * DTO para categoria de serviços
 */
class ServiceCategoryDTO {
  constructor(category, services) {
    this.id = category;
    this.label = CategoryMetadata[category].label;
    this.icon = CategoryMetadata[category].icon;
    this.description = CategoryMetadata[category].description;
    this.order = CategoryMetadata[category].order;
    this.services = services.map(s => s.toJSON());
    this.count = services.length;
  }

  toJSON() {
    return {
      id: this.id,
      label: this.label,
      icon: this.icon,
      description: this.description,
      order: this.order,
      services: this.services,
      count: this.count
    };
  }
}

// ============================================
// USE CASE PRINCIPAL
// ============================================

export class ListServicesUseCase {
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
   * @param {boolean} params.includeOptional - Incluir serviços opcionais (default: true)
   * @param {boolean} params.groupByCategory - Agrupar por categoria (default: true)
   * @param {Array<string>} params.filterByType - Filtrar por tipos específicos
   * @param {Array<string>} params.filterByCategory - Filtrar por categorias específicas
   * @returns {Promise<Object>} Lista de serviços (agrupados ou não)
   */
  async execute({ 
    includeOptional = true, 
    groupByCategory = true,
    filterByType = [],
    filterByCategory = []
  } = {}) {
    try {
      // 1. Buscar todos os serviços
      const allServices = await this.serviceRepository.findAll();

      // 2. Aplicar filtros
      let filteredServices = this._applyFilters(allServices, {
        includeOptional,
        filterByType,
        filterByCategory
      });

      // 3. Converter para DTOs
      const serviceDTOs = filteredServices.map(service => new ServiceItemDTO(service));

      // 4. Ordenar serviços (por nome)
      serviceDTOs.sort((a, b) => a.name.localeCompare(b.name));

      // 5. Agrupar por categoria (se solicitado)
      if (groupByCategory) {
        const grouped = this._groupByCategory(serviceDTOs);
        
        this.logger.info(`Services listed and grouped: ${serviceDTOs.length} services in ${Object.keys(grouped).length} categories`);
        
        return {
          categories: grouped,
          total: serviceDTOs.length
        };
      }

      // 6. Retornar lista plana
      this.logger.info(`Services listed: ${serviceDTOs.length} services`);
      
      return {
        services: serviceDTOs.map(s => s.toJSON()),
        total: serviceDTOs.length
      };
    } catch (error) {
      this.logger.error('Error listing services:', error);
      throw error;
    }
  }

  /**
   * Aplica filtros aos serviços
   * @private
   */
  _applyFilters(services, { includeOptional, filterByType, filterByCategory }) {
    return services.filter(service => {
      // Filtrar opcionais
      if (!includeOptional && service.isOptional) {
        return false;
      }

      // Filtrar por tipo
      if (filterByType.length > 0 && !filterByType.includes(service.type)) {
        return false;
      }

      // Filtrar por categoria (precisa inferir categoria primeiro)
      if (filterByCategory.length > 0) {
        const tempDTO = new ServiceItemDTO(service);
        if (!filterByCategory.includes(tempDTO.category)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Agrupa serviços por categoria
   * @private
   */
  _groupByCategory(serviceDTOs) {
    const grouped = {};

    // Inicializar todas as categorias
    Object.values(ServiceCategory).forEach(category => {
      grouped[category] = [];
    });

    // Agrupar serviços
    serviceDTOs.forEach(service => {
      const category = service.category;
      if (grouped[category]) {
        grouped[category].push(service);
      } else {
        // Categoria não prevista, colocar em OTHER
        grouped[ServiceCategory.OTHER].push(service);
      }
    });

    // Converter para DTOs de categoria e ordenar
    const result = {};
    
    Object.entries(grouped)
      .filter(([_, services]) => services.length > 0)
      .sort(([catA], [catB]) => {
        const orderA = CategoryMetadata[catA]?.order || 999;
        const orderB = CategoryMetadata[catB]?.order || 999;
        return orderA - orderB;
      })
      .forEach(([category, services]) => {
        result[category] = new ServiceCategoryDTO(category, services).toJSON();
      });

    return result;
  }

  /**
   * Retorna apenas serviços por noite (para cálculos)
   */
  async getPerNightServices() {
    return this.execute({
      filterByType: [ServiceType.PER_NIGHT, ServiceType.PER_PERSON_NIGHT],
      groupByCategory: false
    });
  }

  /**
   * Retorna apenas serviços por estadia
   */
  async getPerStayServices() {
    return this.execute({
      filterByType: [ServiceType.PER_STAY, ServiceType.PER_PERSON],
      groupByCategory: false
    });
  }

  /**
   * Retorna serviços de uma categoria específica
   */
  async getByCategory(category) {
    return this.execute({
      filterByCategory: [category],
      groupByCategory: false
    });
  }
}