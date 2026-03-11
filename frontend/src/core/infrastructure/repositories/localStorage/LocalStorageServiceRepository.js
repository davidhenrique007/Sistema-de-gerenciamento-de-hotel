// ============================================
// REPOSITORY: LocalStorageServiceRepository
// ============================================
// Responsabilidade: Implementação concreta do repositório de serviços
// usando localStorage como mecanismo de persistência
// ============================================

// ============================================
// IMPORTAÇÕES
// ============================================
import { Service, ServiceType } from '../../../domain/entities/Service.js';
import { Money } from '../../../domain/value-objects/Money.js';
import { AppError, NotFoundError, ValidationError } from '../../../../shared/utils/errorUtils.js';
import { storage } from '../../../../shared/utils/storage.js';
import { createLogger } from '../../../utils.js';
import { servicesData } from '../../../../data/servicesData.js';

// ============================================
// CONSTANTES
// ============================================
const STORAGE_KEY = 'hotel_paradise_services';
const DEFAULT_LOGGER = createLogger('LocalStorageServiceRepository');

// ============================================
// REPOSITÓRIO PRINCIPAL
// ============================================

export class LocalStorageServiceRepository {
  /**
   * @param {Object} options - Opções de configuração
   * @param {Object} options.storage - Wrapper de storage (opcional)
   * @param {Object} options.logger - Logger (opcional)
   * @param {boolean} options.initializeWithMockData - Inicializar com dados mock
   */
  constructor({ 
    storage: storageWrapper = storage.local, 
    logger = DEFAULT_LOGGER,
    initializeWithMockData = true 
  } = {}) {
    this.storage = storageWrapper;
    this.logger = logger;
    
    // Inicializar dados mock se necessário
    if (initializeWithMockData) {
      this._initializeMockData();
    }
  }

  // ============================================
  // MÉTODOS PRIVADOS - UTILITÁRIOS
  // ============================================

  /**
   * Inicializa dados mock no storage
   * @private
   */
  _initializeMockData() {
    try {
      const existingData = this.storage.getItem(STORAGE_KEY);
      
      if (!existingData) {
        this.logger.info('Inicializando dados mock de serviços...');
        
        // Usar dados mock ou criar dados padrão
        const services = servicesData && servicesData.length > 0 
          ? servicesData.map(serviceData => this._deserializeService(serviceData))
          : this._createDefaultServices();
        
        // Salvar no storage
        this.storage.setItem(STORAGE_KEY, this._serializeServices(services));
        
        this.logger.info(`${services.length} serviços inicializados com sucesso`);
      }
    } catch (error) {
      this.logger.error('Erro ao inicializar dados mock:', error);
    }
  }

  /**
   * Cria serviços padrão caso não existam dados mock
   * @private
   */
  _createDefaultServices() {
    return [
      new Service({
        id: 1,
        name: 'Café da manhã',
        description: 'Café da manhã completo com opções variadas',
        price: new Money(45.00),
        type: ServiceType.PER_PERSON_NIGHT,
        isOptional: true,
        maxQuantity: 2
      }),
      new Service({
        id: 2,
        name: 'Massagem relaxante',
        description: 'Massagem de 60 minutos',
        price: new Money(150.00),
        type: ServiceType.PER_PERSON,
        isOptional: true,
        maxQuantity: 2
      }),
      new Service({
        id: 3,
        name: 'Estacionamento',
        description: 'Vaga coberta no estacionamento',
        price: new Money(30.00),
        type: ServiceType.PER_NIGHT,
        isOptional: true,
        maxQuantity: 1
      }),
      new Service({
        id: 4,
        name: 'Jantar romântico',
        description: 'Jantar especial para duas pessoas',
        price: new Money(280.00),
        type: ServiceType.PER_STAY,
        isOptional: true,
        maxQuantity: 1
      }),
      new Service({
        id: 5,
        name: 'Translado aeroporto',
        description: 'Transporte ida/volta',
        price: new Money(120.00),
        type: ServiceType.PER_PERSON,
        isOptional: true,
        maxQuantity: 4
      })
    ];
  }

  /**
   * Serializa lista de serviços para storage
   * @private
   */
  _serializeServices(services) {
    return services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: {
        amount: service.price.amount,
        currency: service.price.currency
      },
      type: service.type,
      isOptional: service.isOptional,
      maxQuantity: service.maxQuantity
    }));
  }

  /**
   * Desserializa um serviço do storage
   * @private
   */
  _deserializeService(data) {
    try {
      // Validar tipo de serviço
      const validTypes = Object.values(ServiceType);
      if (!validTypes.includes(data.type)) {
        this.logger.warn(`Tipo de serviço inválido ${data.type}, usando PER_STAY como padrão`);
        data.type = ServiceType.PER_STAY;
      }

      return new Service({
        id: data.id,
        name: data.name,
        description: data.description || '',
        price: new Money(data.price.amount, data.price.currency || 'BRL'),
        type: data.type,
        isOptional: data.isOptional !== false,
        maxQuantity: data.maxQuantity || 0
      });
    } catch (error) {
      this.logger.error(`Erro ao desserializar serviço ${data.id}:`, error);
      throw new ValidationError('Falha ao desserializar dados do serviço', {
        serviceId: data.id,
        originalError: error.message
      });
    }
  }

  /**
   * Obtém todos os serviços do storage
   * @private
   */
  _getAllServices() {
    try {
      const data = this.storage.getItem(STORAGE_KEY);
      
      if (!data) {
        return [];
      }

      // Se for array, é a lista serializada
      if (Array.isArray(data)) {
        return data.map(item => this._deserializeService(item));
      }

      return [];
    } catch (error) {
      this.logger.error('Erro ao obter serviços do storage:', error);
      throw new AppError('Falha ao acessar storage de serviços', 'STORAGE_ERROR', {
        originalError: error.message
      });
    }
  }

  /**
   * Salva todos os serviços no storage
   * @private
   */
  _saveAllServices(services) {
    try {
      const serialized = this._serializeServices(services);
      this.storage.setItem(STORAGE_KEY, serialized);
      return true;
    } catch (error) {
      this.logger.error('Erro ao salvar serviços no storage:', error);
      throw new AppError('Falha ao persistir serviços', 'STORAGE_ERROR', {
        originalError: error.message
      });
    }
  }

  /**
   * Aplica filtros aos serviços
   * @private
   */
  _applyFilters(services, filters) {
    return services.filter(service => {
      // Filtrar por tipo
      if (filters.type && service.type !== filters.type) {
        return false;
      }

      // Filtrar por opcional/obrigatório
      if (filters.isOptional !== undefined && service.isOptional !== filters.isOptional) {
        return false;
      }

      // Filtrar por preço máximo
      if (filters.maxPrice && service.price.amount > filters.maxPrice) {
        return false;
      }

      // Filtrar por preço mínimo
      if (filters.minPrice && service.price.amount < filters.minPrice) {
        return false;
      }

      // Filtrar por nome (busca parcial)
      if (filters.searchTerm && !service.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }

      return true;
    });
  }

  // ============================================
  // MÉTODOS PÚBLICOS
  // ============================================

  /**
   * Retorna todos os serviços com filtros opcionais
   * @param {Object} filters - Filtros a serem aplicados
   * @returns {Promise<Array<Service>>}
   */
  async findAll(filters = {}) {
    this.logger.debug('findAll chamado com filtros:', filters);

    try {
      const allServices = this._getAllServices();
      
      if (Object.keys(filters).length === 0) {
        return allServices;
      }

      const filteredServices = this._applyFilters(allServices, filters);
      
      this.logger.debug(`findAll retornou ${filteredServices.length} serviços`);
      
      return filteredServices;
    } catch (error) {
      this.logger.error('Erro em findAll:', error);
      throw error;
    }
  }

  /**
   * Busca um serviço pelo ID
   * @param {string|number} id - ID do serviço
   * @returns {Promise<Service|null>}
   */
  async findById(id) {
    this.logger.debug(`findById chamado com id: ${id}`);

    try {
      const allServices = this._getAllServices();
      const service = allServices.find(s => s.id === id);

      if (!service) {
        this.logger.debug(`Serviço com id ${id} não encontrado`);
        return null;
      }

      return service;
    } catch (error) {
      this.logger.error(`Erro em findById para id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Salva um novo serviço
   * @param {Service} service - Serviço a ser salvo
   * @returns {Promise<Service>}
   */
  async save(service) {
    this.logger.debug(`save chamado para serviço: ${service.name}`);

    try {
      // Validar se é uma instância válida
      if (!(service instanceof Service)) {
        throw new ValidationError('Objeto deve ser uma instância de Service');
      }

      const allServices = this._getAllServices();

      // Verificar se já existe
      const exists = allServices.some(s => s.id === service.id);
      
      if (exists) {
        throw new ValidationError('Serviço com este ID já existe', {
          serviceId: service.id
        });
      }

      // Adicionar à lista
      allServices.push(service);
      
      // Persistir
      this._saveAllServices(allServices);

      this.logger.info(`Serviço ${service.name} salvo com sucesso`);

      return service;
    } catch (error) {
      this.logger.error(`Erro ao salvar serviço ${service.name}:`, error);
      throw error;
    }
  }

  /**
   * Atualiza um serviço existente
   * @param {Service} service - Serviço com dados atualizados
   * @returns {Promise<Service>}
   */
  async update(service) {
    this.logger.debug(`update chamado para serviço: ${service.name}`);

    try {
      // Validar se é uma instância válida
      if (!(service instanceof Service)) {
        throw new ValidationError('Objeto deve ser uma instância de Service');
      }

      const allServices = this._getAllServices();
      
      // Encontrar índice do serviço
      const index = allServices.findIndex(s => s.id === service.id);

      if (index === -1) {
        throw new NotFoundError('Serviço não encontrado para atualização', {
          serviceId: service.id
        });
      }

      // Atualizar serviço
      allServices[index] = service;
      
      // Persistir
      this._saveAllServices(allServices);

      this.logger.info(`Serviço ${service.name} atualizado com sucesso`);

      return service;
    } catch (error) {
      this.logger.error(`Erro ao atualizar serviço ${service.name}:`, error);
      throw error;
    }
  }

  /**
   * Remove um serviço pelo ID
   * @param {string|number} id - ID do serviço
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    this.logger.debug(`delete chamado para id: ${id}`);

    try {
      const allServices = this._getAllServices();
      
      const index = allServices.findIndex(s => s.id === id);

      if (index === -1) {
        throw new NotFoundError('Serviço não encontrado para remoção', {
          serviceId: id
        });
      }

      // Remover serviço
      allServices.splice(index, 1);
      
      // Persistir
      this._saveAllServices(allServices);

      this.logger.info(`Serviço ${id} removido com sucesso`);

      return true;
    } catch (error) {
      this.logger.error(`Erro ao remover serviço ${id}:`, error);
      throw error;
    }
  }

  /**
   * Verifica se um serviço existe
   * @param {string|number} id - ID do serviço
   * @returns {Promise<boolean>}
   */
  async exists(id) {
    this.logger.debug(`exists chamado para id: ${id}`);

    try {
      const allServices = this._getAllServices();
      return allServices.some(s => s.id === id);
    } catch (error) {
      this.logger.error(`Erro em exists para id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Retorna serviços por tipo
   * @param {string} type - Tipo do serviço (ServiceType)
   * @returns {Promise<Array<Service>>}
   */
  async findByType(type) {
    this.logger.debug(`findByType chamado para tipo: ${type}`);

    try {
      const allServices = this._getAllServices();
      return allServices.filter(s => s.type === type);
    } catch (error) {
      this.logger.error(`Erro em findByType para tipo ${type}:`, error);
      throw error;
    }
  }

  /**
   * Retorna serviços opcionais
   * @returns {Promise<Array<Service>>}
   */
  async findOptional() {
    this.logger.debug('findOptional chamado');

    try {
      const allServices = this._getAllServices();
      return allServices.filter(s => s.isOptional);
    } catch (error) {
      this.logger.error('Erro em findOptional:', error);
      throw error;
    }
  }

  /**
   * Retorna serviços obrigatórios
   * @returns {Promise<Array<Service>>}
   */
  async findRequired() {
    this.logger.debug('findRequired chamado');

    try {
      const allServices = this._getAllServices();
      return allServices.filter(s => !s.isOptional);
    } catch (error) {
      this.logger.error('Erro em findRequired:', error);
      throw error;
    }
  }

  /**
   * Retorna serviços por preço máximo
   * @param {number} maxPrice - Preço máximo
   * @returns {Promise<Array<Service>>}
   */
  async findByMaxPrice(maxPrice) {
    this.logger.debug(`findByMaxPrice chamado para maxPrice: ${maxPrice}`);

    try {
      const allServices = this._getAllServices();
      return allServices.filter(s => s.price.amount <= maxPrice);
    } catch (error) {
      this.logger.error(`Erro em findByMaxPrice para maxPrice ${maxPrice}:`, error);
      throw error;
    }
  }

  /**
   * Retorna serviços por nome (busca parcial)
   * @param {string} searchTerm - Termo de busca
   * @returns {Promise<Array<Service>>}
   */
  async searchByName(searchTerm) {
    this.logger.debug(`searchByName chamado para termo: ${searchTerm}`);

    try {
      const allServices = this._getAllServices();
      const term = searchTerm.toLowerCase();
      return allServices.filter(s => s.name.toLowerCase().includes(term));
    } catch (error) {
      this.logger.error(`Erro em searchByName para termo ${searchTerm}:`, error);
      throw error;
    }
  }
}