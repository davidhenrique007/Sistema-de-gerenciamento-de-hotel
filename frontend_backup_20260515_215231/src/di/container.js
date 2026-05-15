// ============================================
// CONTAINER: Dependency Injection Container
// ============================================
// Responsabilidade: Centralizar registro e resolução de dependências
// Padrões: Service Locator, Factory Pattern, Singleton Pattern
// ============================================

// ============================================
// IMPORTAÇÕES - REPOSITÓRIOS
// ============================================
import { LocalStorageRoomRepository } from '../core/infrastructure/repositories/localStorage/LocalStorageRoomRepository.js';
import { LocalStorageReservationRepository } from '../core/infrastructure/repositories/localStorage/LocalStorageReservationRepository.js';
import { LocalStorageServiceRepository } from '../core/infrastructure/repositories/localStorage/LocalStorageServiceRepository.js';

// ============================================
// IMPORTAÇÕES - USE CASES (DIA 06)
// ============================================
import { ListAvailableRoomsUseCase } from '../core/application/use-cases/rooms/ListAvailableRoomsUseCase.js';
import { GetRoomDetailsUseCase } from '../core/application/use-cases/rooms/GetRoomDetailsUseCase.js';

// ============================================
// IMPORTAÇÕES - USE CASES (DIA 07)
// ============================================
import { UpdateRoomOccupancyUseCase } from '../core/application/use-cases/rooms/UpdateRoomOccupancyUseCase.js';
import { ValidateRoomAvailabilityUseCase } from '../core/application/use-cases/rooms/ValidateRoomAvailabilityUseCase.js';

// ============================================
// IMPORTAÇÕES - USE CASES (DIA 08)
// ============================================
import { CalculatePriceUseCase } from '../core/application/use-cases/reservation/CalculatePriceUseCase.js';
import { ValidateReservationUseCase } from '../core/application/use-cases/reservation/ValidateReservationUseCase.js';

// ============================================
// IMPORTAÇÕES - USE CASES (DIA 09)
// ============================================
import { ListServicesUseCase } from '../core/application/use-cases/services/ListServicesUseCase.js';
import { CalculateServicesPriceUseCase } from '../core/application/use-cases/services/CalculateServicesPriceUseCase.js';

// ============================================
// IMPORTAÇÕES - SERVIÇOS DE INFRAESTRUTURA (DIA 12)
// ============================================
import { DefaultPricingService } from '../core/infrastructure/services/pricing/DefaultPricingService.js';
import { DefaultAvailabilityService } from '../core/infrastructure/services/availability/DefaultAvailabilityService.js';

// ============================================
// IMPORTAÇÕES - UTILITÁRIOS
// ============================================
import { createLogger } from '../core/utils.js';
import { storage } from '../shared/utils/storage.js';

// ============================================
// CONSTANTES - TIPOS DE CICLO DE VIDA
// ============================================

const LIFECYCLE = {
  SINGLETON: 'singleton', // Uma única instância para toda a aplicação
  TRANSIENT: 'transient', // Nova instância a cada resolução
  SCOPED: 'scoped'        // Instância por escopo (ex: por requisição)
};

// ============================================
// CONTAINER PRINCIPAL
// ============================================

export class DIContainer {
  constructor(options = {}) {
    // Configurações
    this.options = {
      environment: process.env.NODE_ENV || 'development',
      enableLogging: true,
      ...options
    };

    // Registros de dependências
    this._registry = new Map();
    
    // Cache de instâncias (para singletons)
    this._instances = new Map();
    
    // Logger
    this.logger = createLogger('DIContainer');

    // Inicializar container
    this._initialize();
  }

  // ============================================
  // MÉTODOS DE REGISTRO
  // ============================================

  /**
   * Registra uma dependência no container
   * @param {string} key - Chave da dependência
   * @param {Function} factory - Função factory que cria a instância
   * @param {string} lifecycle - Ciclo de vida (singleton, transient, scoped)
   */
  register(key, factory, lifecycle = LIFECYCLE.SINGLETON) {
    if (this._registry.has(key)) {
      this.logger.warn(`Dependência ${key} já registrada. Substituindo...`);
    }

    this._registry.set(key, { factory, lifecycle });
    this.logger.debug(`Dependência ${key} registrada como ${lifecycle}`);
  }

  /**
   * Registra uma dependência como singleton (padrão)
   * @param {string} key - Chave da dependência
   * @param {Function} factory - Função factory
   */
  registerSingleton(key, factory) {
    this.register(key, factory, LIFECYCLE.SINGLETON);
  }

  /**
   * Registra uma dependência como transient (nova instância a cada chamada)
   * @param {string} key - Chave da dependência
   * @param {Function} factory - Função factory
   */
  registerTransient(key, factory) {
    this.register(key, factory, LIFECYCLE.TRANSIENT);
  }

  // ============================================
  // MÉTODOS DE RESOLUÇÃO
  // ============================================

  /**
   * Resolve uma dependência pelo nome
   * @param {string} key - Chave da dependência
   * @returns {*} Instância da dependência
   */
  resolve(key) {
    if (!this._registry.has(key)) {
      throw new Error(`Dependência não registrada: ${key}`);
    }

    const { factory, lifecycle } = this._registry.get(key);

    // Singleton: retorna instância em cache
    if (lifecycle === LIFECYCLE.SINGLETON) {
      if (!this._instances.has(key)) {
        this._instances.set(key, factory(this));
      }
      return this._instances.get(key);
    }

    // Transient: nova instância a cada chamada
    if (lifecycle === LIFECYCLE.TRANSIENT) {
      return factory(this);
    }

    // Scoped: seria implementado com escopo de requisição
    throw new Error(`Ciclo de vida não implementado: ${lifecycle}`);
  }

  /**
   * Verifica se uma dependência está registrada
   * @param {string} key - Chave da dependência
   * @returns {boolean} true se registrada
   */
  has(key) {
    return this._registry.has(key);
  }

  /**
   * Remove uma dependência do cache (útil para testes)
   * @param {string} key - Chave da dependência
   */
  clearInstance(key) {
    this._instances.delete(key);
  }

  /**
   * Limpa todo o cache de instâncias
   */
  clearAllInstances() {
    this._instances.clear();
  }

  // ============================================
  // MÉTODOS DE RESOLUÇÃO POR CATEGORIA
  // ============================================

  /**
   * Retorna todos os repositórios
   * @returns {Object} Repositórios
   */
  getRepositories() {
    return {
      roomRepository: this.resolve('roomRepository'),
      reservationRepository: this.resolve('reservationRepository'),
      serviceRepository: this.resolve('serviceRepository')
    };
  }

  /**
   * Retorna todos os use cases de quartos
   * @returns {Object} Use cases de quartos
   */
  getRoomUseCases() {
    return {
      listAvailableRooms: this.resolve('listAvailableRoomsUseCase'),
      getRoomDetails: this.resolve('getRoomDetailsUseCase'),
      updateRoomOccupancy: this.resolve('updateRoomOccupancyUseCase'),
      validateRoomAvailability: this.resolve('validateRoomAvailabilityUseCase')
    };
  }

  /**
   * Retorna todos os use cases de reserva
   * @returns {Object} Use cases de reserva
   */
  getReservationUseCases() {
    return {
      calculatePrice: this.resolve('calculatePriceUseCase'),
      validateReservation: this.resolve('validateReservationUseCase')
    };
  }

  /**
   * Retorna todos os use cases de serviços
   * @returns {Object} Use cases de serviços
   */
  getServiceUseCases() {
    return {
      listServices: this.resolve('listServicesUseCase'),
      calculateServicesPrice: this.resolve('calculateServicesPriceUseCase')
    };
  }

  /**
   * Retorna todos os serviços de infraestrutura
   * @returns {Object} Serviços de infraestrutura
   */
  getInfrastructureServices() {
    return {
      pricingService: this.resolve('pricingService'),
      availabilityService: this.resolve('availabilityService')
    };
  }

  // ============================================
  // INICIALIZAÇÃO
  // ============================================

  /**
   * Inicializa o container com todas as dependências
   * @private
   */
  _initialize() {
    this.logger.info('Inicializando container de dependências...');

    // ==========================================
    // 1. REPOSITÓRIOS (SINGLETON)
    // ==========================================
    
    this.registerSingleton('roomRepository', (c) => {
      return new LocalStorageRoomRepository({
        storage: storage.local,
        logger: createLogger('RoomRepository'),
        initializeWithMockData: true
      });
    });

    this.registerSingleton('serviceRepository', (c) => {
      return new LocalStorageServiceRepository({
        storage: storage.local,
        logger: createLogger('ServiceRepository'),
        initializeWithMockData: true
      });
    });

    this.registerSingleton('reservationRepository', (c) => {
      return new LocalStorageReservationRepository({
        storage: storage.local,
        logger: createLogger('ReservationRepository'),
        initializeWithMockData: true,
        roomRepository: c.resolve('roomRepository'),
        serviceRepository: c.resolve('serviceRepository')
      });
    });

    // ==========================================
    // 2. SERVIÇOS DE INFRAESTRUTURA (SINGLETON)
    // ==========================================

    this.registerSingleton('pricingService', (c) => {
      return new DefaultPricingService({
        logger: createLogger('PricingService')
      });
    });

    this.registerSingleton('availabilityService', (c) => {
      return new DefaultAvailabilityService({
        roomRepository: c.resolve('roomRepository'),
        reservationRepository: c.resolve('reservationRepository'),
        logger: createLogger('AvailabilityService')
      });
    });

    // ==========================================
    // 3. USE CASES (TRANSIENT - podem ter estado)
    // ==========================================

    // DIA 06 - Use Cases de Quartos (Listagem)
    this.registerTransient('listAvailableRoomsUseCase', (c) => {
      return new ListAvailableRoomsUseCase({
        roomRepository: c.resolve('roomRepository'),
        logger: createLogger('ListAvailableRoomsUseCase')
      });
    });

    this.registerTransient('getRoomDetailsUseCase', (c) => {
      return new GetRoomDetailsUseCase({
        roomRepository: c.resolve('roomRepository'),
        logger: createLogger('GetRoomDetailsUseCase')
      });
    });

    // DIA 07 - Use Cases de Ocupação
    this.registerTransient('updateRoomOccupancyUseCase', (c) => {
      return new UpdateRoomOccupancyUseCase({
        roomRepository: c.resolve('roomRepository'),
        logger: createLogger('UpdateRoomOccupancyUseCase')
      });
    });

    this.registerTransient('validateRoomAvailabilityUseCase', (c) => {
      return new ValidateRoomAvailabilityUseCase({
        roomRepository: c.resolve('roomRepository'),
        reservationRepository: c.resolve('reservationRepository'),
        logger: createLogger('ValidateRoomAvailabilityUseCase')
      });
    });

    // DIA 08 - Use Cases de Reserva
    this.registerTransient('calculatePriceUseCase', (c) => {
      return new CalculatePriceUseCase({
        roomRepository: c.resolve('roomRepository'),
        serviceRepository: c.resolve('serviceRepository'),
        logger: createLogger('CalculatePriceUseCase')
      });
    });

    this.registerTransient('validateReservationUseCase', (c) => {
      return new ValidateReservationUseCase({
        roomRepository: c.resolve('roomRepository'),
        serviceRepository: c.resolve('serviceRepository'),
        reservationRepository: c.resolve('reservationRepository'),
        logger: createLogger('ValidateReservationUseCase')
      });
    });

    // DIA 09 - Use Cases de Serviços
    this.registerTransient('listServicesUseCase', (c) => {
      return new ListServicesUseCase({
        serviceRepository: c.resolve('serviceRepository'),
        logger: createLogger('ListServicesUseCase')
      });
    });

    this.registerTransient('calculateServicesPriceUseCase', (c) => {
      return new CalculateServicesPriceUseCase({
        serviceRepository: c.resolve('serviceRepository'),
        logger: createLogger('CalculateServicesPriceUseCase')
      });
    });

    this.logger.info('Container inicializado com sucesso');
  }
}

// ============================================
// SINGLETON GLOBAL DO CONTAINER
// ============================================

let globalContainer = null;

/**
 * Retorna a instância global do container
 * @returns {DIContainer} Container global
 */
export const getContainer = () => {
  if (!globalContainer) {
    globalContainer = new DIContainer();
  }
  return globalContainer;
};

/**
 * Reseta o container global (útil para testes)
 */
export const resetContainer = () => {
  globalContainer = null;
};

/**
 * Cria um novo container para testes
 * @returns {DIContainer} Novo container
 */
export const createTestContainer = () => {
  return new DIContainer({ environment: 'test', enableLogging: false });
};