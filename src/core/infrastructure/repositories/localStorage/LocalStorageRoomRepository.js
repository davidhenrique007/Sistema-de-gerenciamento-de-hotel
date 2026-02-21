// ============================================
// REPOSITORY: LocalStorageRoomRepository
// ============================================
// Responsabilidade: Implementação concreta do repositório de quartos
// usando localStorage como mecanismo de persistência
// ============================================

// ============================================
// IMPORTAÇÕES
// ============================================
import { Room } from '../../../domain/entities/Room.js';
import { Money } from '../../../domain/value-objects/Money.js';
import { OccupancyStatuses } from '../../../domain/value-objects/OccupancyStatus.js';
import { AppError, NotFoundError, ValidationError } from '../../../../shared/utils/errorUtils.js';
import { storage } from '../../../../shared/utils/storage.js';
import { createLogger } from '../../../utils.js';
import { roomsData } from '../../../../data/roomsData.js';

// ============================================
// CONSTANTES
// ============================================
const STORAGE_KEY = 'hotel_paradise_rooms';
const DEFAULT_LOGGER = createLogger('LocalStorageRoomRepository');

// ============================================
// REPOSITÓRIO PRINCIPAL
// ============================================

export class LocalStorageRoomRepository {
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
        this.logger.info('Inicializando dados mock de quartos...');
        
        // Converter dados mock para entidades Room
        const rooms = roomsData.map(roomData => this._deserializeRoom(roomData));
        
        // Salvar no storage
        this.storage.setItem(STORAGE_KEY, this._serializeRooms(rooms));
        
        this.logger.info(`${rooms.length} quartos inicializados com sucesso`);
      }
    } catch (error) {
      this.logger.error('Erro ao inicializar dados mock:', error);
    }
  }

  /**
   * Serializa lista de quartos para storage
   * @private
   */
  _serializeRooms(rooms) {
    return rooms.map(room => ({
      id: room.id,
      number: room.number,
      type: room.type,
      capacity: room.capacity,
      pricePerNight: {
        amount: room.pricePerNight.amount,
        currency: room.pricePerNight.currency
      },
      status: room.status.value,
      amenities: room.amenities
    }));
  }

  /**
   * Desserializa um quarto do storage
   * @private
   */
  _deserializeRoom(data) {
    try {
      // Mapear status
      const statusMap = {
        'AVAILABLE': OccupancyStatuses.AVAILABLE,
        'OCCUPIED': OccupancyStatuses.OCCUPIED,
        'MAINTENANCE': OccupancyStatuses.MAINTENANCE,
        'RESERVED': OccupancyStatuses.RESERVED,
        'CLEANING': OccupancyStatuses.CLEANING
      };

      const status = statusMap[data.status] || OccupancyStatuses.AVAILABLE;

      // Criar entidade Room
      return new Room({
        id: data.id,
        number: data.number,
        type: data.type,
        capacity: data.capacity,
        pricePerNight: new Money(data.pricePerNight.amount, data.pricePerNight.currency || 'BRL'),
        status,
        amenities: data.amenities || []
      });
    } catch (error) {
      this.logger.error(`Erro ao desserializar quarto ${data.id}:`, error);
      throw new ValidationError('Falha ao desserializar dados do quarto', {
        roomId: data.id,
        originalError: error.message
      });
    }
  }

  /**
   * Obtém todos os quartos do storage
   * @private
   */
  _getAllRooms() {
    try {
      const data = this.storage.getItem(STORAGE_KEY);
      
      if (!data) {
        return [];
      }

      // Se for array, é a lista serializada
      if (Array.isArray(data)) {
        return data.map(item => this._deserializeRoom(item));
      }

      return [];
    } catch (error) {
      this.logger.error('Erro ao obter quartos do storage:', error);
      throw new AppError('Falha ao acessar storage de quartos', 'STORAGE_ERROR', {
        originalError: error.message
      });
    }
  }

  /**
   * Salva todos os quartos no storage
   * @private
   */
  _saveAllRooms(rooms) {
    try {
      const serialized = this._serializeRooms(rooms);
      this.storage.setItem(STORAGE_KEY, serialized);
      return true;
    } catch (error) {
      this.logger.error('Erro ao salvar quartos no storage:', error);
      throw new AppError('Falha ao persistir quartos', 'STORAGE_ERROR', {
        originalError: error.message
      });
    }
  }

  /**
   * Aplica filtros aos quartos
   * @private
   */
  _applyFilters(rooms, filters) {
    return rooms.filter(room => {
      // Filtrar apenas disponíveis
      if (filters.onlyAvailable && !room.isAvailable()) {
        return false;
      }

      // Filtrar por tipo
      if (filters.type && room.type.toLowerCase() !== filters.type.toLowerCase()) {
        return false;
      }

      // Filtrar por capacidade mínima
      if (filters.minCapacity && room.capacity < filters.minCapacity) {
        return false;
      }

      // Filtrar por preço máximo
      if (filters.maxPrice && room.pricePerNight.amount > filters.maxPrice) {
        return false;
      }

      // Filtrar por preço mínimo
      if (filters.minPrice && room.pricePerNight.amount < filters.minPrice) {
        return false;
      }

      // Filtrar por amenities (se todas as solicitadas estiverem presentes)
      if (filters.amenities && filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(amenity =>
          room.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()))
        );
        if (!hasAllAmenities) {
          return false;
        }
      }

      return true;
    });
  }

  // ============================================
  // MÉTODOS PÚBLICOS
  // ============================================

  /**
   * Retorna todos os quartos com filtros opcionais
   * @param {Object} filters - Filtros a serem aplicados
   * @returns {Promise<Array<Room>>}
   */
  async findAll(filters = {}) {
    this.logger.debug('findAll chamado com filtros:', filters);

    try {
      const allRooms = this._getAllRooms();
      
      if (Object.keys(filters).length === 0) {
        return allRooms;
      }

      const filteredRooms = this._applyFilters(allRooms, filters);
      
      this.logger.debug(`findAll retornou ${filteredRooms.length} quartos`);
      
      return filteredRooms;
    } catch (error) {
      this.logger.error('Erro em findAll:', error);
      throw error;
    }
  }

  /**
   * Busca um quarto pelo ID
   * @param {string|number} id - ID do quarto
   * @returns {Promise<Room|null>}
   */
  async findById(id) {
    this.logger.debug(`findById chamado com id: ${id}`);

    try {
      const allRooms = this._getAllRooms();
      const room = allRooms.find(r => r.id === id);

      if (!room) {
        this.logger.debug(`Quarto com id ${id} não encontrado`);
        return null;
      }

      return room;
    } catch (error) {
      this.logger.error(`Erro em findById para id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Busca um quarto pelo número
   * @param {string} number - Número do quarto
   * @returns {Promise<Room|null>}
   */
  async findByNumber(number) {
    this.logger.debug(`findByNumber chamado com número: ${number}`);

    try {
      const allRooms = this._getAllRooms();
      const room = allRooms.find(r => r.number === number);

      if (!room) {
        this.logger.debug(`Quarto com número ${number} não encontrado`);
        return null;
      }

      return room;
    } catch (error) {
      this.logger.error(`Erro em findByNumber para número ${number}:`, error);
      throw error;
    }
  }

  /**
   * Salva um novo quarto
   * @param {Room} room - Quarto a ser salvo
   * @returns {Promise<Room>}
   */
  async save(room) {
    this.logger.debug(`save chamado para quarto: ${room.number}`);

    try {
      // Validar se é uma instância válida
      if (!(room instanceof Room)) {
        throw new ValidationError('Objeto deve ser uma instância de Room');
      }

      const allRooms = this._getAllRooms();

      // Verificar se já existe
      const exists = allRooms.some(r => r.id === room.id || r.number === room.number);
      
      if (exists) {
        throw new ValidationError('Quarto com este ID ou número já existe', {
          roomId: room.id,
          roomNumber: room.number
        });
      }

      // Adicionar à lista
      allRooms.push(room);
      
      // Persistir
      this._saveAllRooms(allRooms);

      this.logger.info(`Quarto ${room.number} salvo com sucesso`);

      return room;
    } catch (error) {
      this.logger.error(`Erro ao salvar quarto ${room.number}:`, error);
      throw error;
    }
  }

  /**
   * Atualiza um quarto existente
   * @param {Room} room - Quarto com dados atualizados
   * @returns {Promise<Room>}
   */
  async update(room) {
    this.logger.debug(`update chamado para quarto: ${room.number}`);

    try {
      // Validar se é uma instância válida
      if (!(room instanceof Room)) {
        throw new ValidationError('Objeto deve ser uma instância de Room');
      }

      const allRooms = this._getAllRooms();
      
      // Encontrar índice do quarto
      const index = allRooms.findIndex(r => r.id === room.id);

      if (index === -1) {
        throw new NotFoundError('Quarto não encontrado para atualização', {
          roomId: room.id
        });
      }

      // Verificar se o número não conflita com outro quarto
      const numberConflict = allRooms.some(r => 
        r.id !== room.id && r.number === room.number
      );

      if (numberConflict) {
        throw new ValidationError('Número de quarto já está em uso por outro quarto', {
          roomNumber: room.number
        });
      }

      // Atualizar quarto
      allRooms[index] = room;
      
      // Persistir
      this._saveAllRooms(allRooms);

      this.logger.info(`Quarto ${room.number} atualizado com sucesso`);

      return room;
    } catch (error) {
      this.logger.error(`Erro ao atualizar quarto ${room.number}:`, error);
      throw error;
    }
  }

  /**
   * Remove um quarto pelo ID
   * @param {string|number} id - ID do quarto
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    this.logger.debug(`delete chamado para id: ${id}`);

    try {
      const allRooms = this._getAllRooms();
      
      const index = allRooms.findIndex(r => r.id === id);

      if (index === -1) {
        throw new NotFoundError('Quarto não encontrado para remoção', {
          roomId: id
        });
      }

      // Verificar se pode ser removido (não está ocupado)
      if (allRooms[index].isOccupied()) {
        throw new ValidationError('Não é possível remover um quarto ocupado', {
          roomId: id,
          status: allRooms[index].status.value
        });
      }

      // Remover quarto
      allRooms.splice(index, 1);
      
      // Persistir
      this._saveAllRooms(allRooms);

      this.logger.info(`Quarto ${id} removido com sucesso`);

      return true;
    } catch (error) {
      this.logger.error(`Erro ao remover quarto ${id}:`, error);
      throw error;
    }
  }

  /**
   * Verifica se um quarto existe
   * @param {string|number} id - ID do quarto
   * @returns {Promise<boolean>}
   */
  async exists(id) {
    this.logger.debug(`exists chamado para id: ${id}`);

    try {
      const allRooms = this._getAllRooms();
      return allRooms.some(r => r.id === id);
    } catch (error) {
      this.logger.error(`Erro em exists para id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Retorna quartos por tipo
   * @param {string} type - Tipo de quarto
   * @returns {Promise<Array<Room>>}
   */
  async findByType(type) {
    this.logger.debug(`findByType chamado para tipo: ${type}`);

    try {
      const allRooms = this._getAllRooms();
      return allRooms.filter(r => r.type.toLowerCase() === type.toLowerCase());
    } catch (error) {
      this.logger.error(`Erro em findByType para tipo ${type}:`, error);
      throw error;
    }
  }

  /**
   * Retorna quartos com capacidade mínima
   * @param {number} capacity - Capacidade mínima
   * @returns {Promise<Array<Room>>}
   */
  async findByMinCapacity(capacity) {
    this.logger.debug(`findByMinCapacity chamado para capacidade: ${capacity}`);

    try {
      const allRooms = this._getAllRooms();
      return allRooms.filter(r => r.capacity >= capacity);
    } catch (error) {
      this.logger.error(`Erro em findByMinCapacity para capacidade ${capacity}:`, error);
      throw error;
    }
  }

  /**
   * Retorna quartos disponíveis
   * @returns {Promise<Array<Room>>}
   */
  async findAvailable() {
    this.logger.debug('findAvailable chamado');

    try {
      const allRooms = this._getAllRooms();
      return allRooms.filter(r => r.isAvailable());
    } catch (error) {
      this.logger.error('Erro em findAvailable:', error);
      throw error;
    }
  }

  /**
   * Retorna quartos ocupados
   * @returns {Promise<Array<Room>>}
   */
  async findOccupied() {
    this.logger.debug('findOccupied chamado');

    try {
      const allRooms = this._getAllRooms();
      return allRooms.filter(r => r.isOccupied());
    } catch (error) {
      this.logger.error('Erro em findOccupied:', error);
      throw error;
    }
  }

  /**
   * Retorna quartos em manutenção
   * @returns {Promise<Array<Room>>}
   */
  async findUnderMaintenance() {
    this.logger.debug('findUnderMaintenance chamado');

    try {
      const allRooms = this._getAllRooms();
      return allRooms.filter(r => r.isUnderMaintenance());
    } catch (error) {
      this.logger.error('Erro em findUnderMaintenance:', error);
      throw error;
    }
  }
}