// ============================================
// REPOSITORY: LocalStorageReservationRepository
// ============================================
// Responsabilidade: Implementação concreta do repositório de reservas
// usando localStorage como mecanismo de persistência
// ============================================

// ============================================
// IMPORTAÇÕES
// ============================================
import { Reservation, ReservationStatus } from '../../../domain/entities/Reservation.js';
import { Room } from '../../../domain/entities/Room.js';
import { Service } from '../../../domain/entities/Service.js';
import { DateRange } from '../../../domain/value-objects/DateRange.js';
import { Money } from '../../../domain/value-objects/Money.js';
import { AppError, NotFoundError, ValidationError, ConflictError } from '../../../../shared/utils/errorUtils.js';
import { storage } from '../../../../shared/utils/storage.js';
import { createLogger } from '../../../utils.js';

// ============================================
// CONSTANTES
// ============================================
const STORAGE_KEY = 'hotel_paradise_reservations';
const DEFAULT_LOGGER = createLogger('LocalStorageReservationRepository');

// ============================================
// REPOSITÓRIO PRINCIPAL
// ============================================

export class LocalStorageReservationRepository {
  /**
   * @param {Object} options - Opções de configuração
   * @param {Object} options.storage - Wrapper de storage (opcional)
   * @param {Object} options.logger - Logger (opcional)
   * @param {boolean} options.initializeWithMockData - Inicializar com dados mock
   * @param {Object} options.roomRepository - Repositório de quartos (para referências)
   * @param {Object} options.serviceRepository - Repositório de serviços (para referências)
   */
  constructor({ 
    storage: storageWrapper = storage.local, 
    logger = DEFAULT_LOGGER,
    initializeWithMockData = true,
    roomRepository = null,
    serviceRepository = null
  } = {}) {
    this.storage = storageWrapper;
    this.logger = logger;
    this.roomRepository = roomRepository;
    this.serviceRepository = serviceRepository;
    
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
        this.logger.info('Inicializando dados mock de reservas (vazio)...');
        
        // Iniciar com array vazio
        this.storage.setItem(STORAGE_KEY, []);
        
        this.logger.info('Repositório de reservas inicializado');
      }
    } catch (error) {
      this.logger.error('Erro ao inicializar dados mock:', error);
    }
  }

  /**
   * Serializa lista de reservas para storage
   * @private
   */
  _serializeReservations(reservations) {
    return reservations.map(reservation => ({
      id: reservation.id,
      roomId: reservation.room.id,
      checkIn: reservation.dateRange.checkIn.toISOString(),
      checkOut: reservation.dateRange.checkOut.toISOString(),
      guest: reservation.guest,
      guestsCount: reservation.guestsCount,
      serviceIds: reservation.services.map(s => s.id),
      status: reservation.status,
      createdAt: reservation.createdAt.toISOString(),
      checkedInAt: reservation.checkedInAt?.toISOString() || null,
      checkedOutAt: reservation.checkedOutAt?.toISOString() || null,
      cancelledAt: reservation.cancelledAt?.toISOString() || null,
      totalPrice: {
        amount: reservation.totalPrice.amount,
        currency: reservation.totalPrice.currency
      }
    }));
  }

  /**
   * Desserializa uma reserva do storage
   * @private
   */
  async _deserializeReservation(data) {
    try {
      // Verificar se temos os repositórios necessários
      if (!this.roomRepository || !this.serviceRepository) {
        throw new ValidationError('Repositórios de quarto e serviço são necessários para desserialização');
      }

      // Buscar quarto
      const room = await this.roomRepository.findById(data.roomId);
      if (!room) {
        throw new NotFoundError(`Quarto com ID ${data.roomId} não encontrado`, {
          roomId: data.roomId
        });
      }

      // Buscar serviços
      const services = [];
      for (const serviceId of data.serviceIds || []) {
        const service = await this.serviceRepository.findById(serviceId);
        if (service) {
          services.push(service);
        } else {
          this.logger.warn(`Serviço ${serviceId} não encontrado para reserva ${data.id}`);
        }
      }

      // Criar DateRange
      const dateRange = new DateRange(
        new Date(data.checkIn),
        new Date(data.checkOut)
      );

      // Criar reserva
      return new Reservation({
        id: data.id,
        room,
        dateRange,
        guest: data.guest,
        guestsCount: data.guestsCount,
        services,
        status: data.status,
        createdAt: new Date(data.createdAt),
        checkedInAt: data.checkedInAt ? new Date(data.checkedInAt) : null,
        checkedOutAt: data.checkedOutAt ? new Date(data.checkedOutAt) : null,
        cancelledAt: data.cancelledAt ? new Date(data.cancelledAt) : null
      });
    } catch (error) {
      this.logger.error(`Erro ao desserializar reserva ${data.id}:`, error);
      throw new ValidationError('Falha ao desserializar dados da reserva', {
        reservationId: data.id,
        originalError: error.message
      });
    }
  }

  /**
   * Obtém todas as reservas do storage
   * @private
   */
  _getAllReservations() {
    try {
      const data = this.storage.getItem(STORAGE_KEY);
      
      if (!data) {
        return [];
      }

      return Array.isArray(data) ? data : [];
    } catch (error) {
      this.logger.error('Erro ao obter reservas do storage:', error);
      throw new AppError('Falha ao acessar storage de reservas', 'STORAGE_ERROR', {
        originalError: error.message
      });
    }
  }

  /**
   * Salva todas as reservas no storage
   * @private
   */
  _saveAllReservations(reservations) {
    try {
      const serialized = this._serializeReservations(reservations);
      this.storage.setItem(STORAGE_KEY, serialized);
      return true;
    } catch (error) {
      this.logger.error('Erro ao salvar reservas no storage:', error);
      throw new AppError('Falha ao persistir reservas', 'STORAGE_ERROR', {
        originalError: error.message
      });
    }
  }

  /**
   * Aplica opções de consulta (paginação, ordenação)
   * @private
   */
  _applyQueryOptions(reservations, options = {}) {
    let result = [...reservations];

    // Ordenação
    if (options.sortBy) {
      const sortOrder = options.sortOrder === 'desc' ? -1 : 1;
      result.sort((a, b) => {
        const aVal = a[options.sortBy];
        const bVal = b[options.sortBy];
        return aVal > bVal ? sortOrder : aVal < bVal ? -sortOrder : 0;
      });
    }

    // Paginação
    if (options.offset !== undefined) {
      result = result.slice(options.offset);
    }

    if (options.limit !== undefined) {
      result = result.slice(0, options.limit);
    }

    return result;
  }

  /**
   * Verifica conflito de datas
   * @private
   */
  _checkDateConflict(reservations, roomId, dateRange, excludeId = null) {
    return reservations.some(res => {
      // Ignorar a própria reserva se estiver sendo editada
      if (excludeId && res.id === excludeId) {
        return false;
      }

      // Ignorar reservas canceladas ou finalizadas
      if (res.status === ReservationStatus.CANCELLED || 
          res.status === ReservationStatus.CHECKED_OUT ||
          res.status === ReservationStatus.NO_SHOW) {
        return false;
      }

      // Verificar se é o mesmo quarto
      if (res.room.id !== roomId) {
        return false;
      }

      // Verificar sobreposição de períodos
      return res.dateRange.overlaps(dateRange);
    });
  }

  // ============================================
  // MÉTODOS PÚBLICOS
  // ============================================

  /**
   * Retorna todas as reservas
   * @param {Object} options - Opções de consulta
   * @returns {Promise<Array<Reservation>>}
   */
  async findAll(options = {}) {
    this.logger.debug('findAll chamado com opções:', options);

    try {
      const serialized = this._getAllReservations();
      const reservations = [];
      
      for (const item of serialized) {
        try {
          const reservation = await this._deserializeReservation(item);
          reservations.push(reservation);
        } catch (error) {
          this.logger.warn(`Reserva ${item.id} ignorada devido a erro de desserialização:`, error);
        }
      }

      const result = this._applyQueryOptions(reservations, options);
      
      this.logger.debug(`findAll retornou ${result.length} reservas`);
      
      return result;
    } catch (error) {
      this.logger.error('Erro em findAll:', error);
      throw error;
    }
  }

  /**
   * Busca uma reserva pelo ID
   * @param {string|number} id - ID da reserva
   * @returns {Promise<Reservation|null>}
   */
  async findById(id) {
    this.logger.debug(`findById chamado com id: ${id}`);

    try {
      const serialized = this._getAllReservations();
      const data = serialized.find(r => r.id === id);

      if (!data) {
        this.logger.debug(`Reserva com id ${id} não encontrada`);
        return null;
      }

      return await this._deserializeReservation(data);
    } catch (error) {
      this.logger.error(`Erro em findById para id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Salva uma nova reserva
   * @param {Reservation} reservation - Reserva a ser salva
   * @returns {Promise<Reservation>}
   */
  async save(reservation) {
    this.logger.debug(`save chamado para reserva: ${reservation.id}`);

    try {
      // Validar se é uma instância válida
      if (!(reservation instanceof Reservation)) {
        throw new ValidationError('Objeto deve ser uma instância de Reservation');
      }

      const serialized = this._getAllReservations();

      // Verificar se já existe
      const exists = serialized.some(r => r.id === reservation.id);
      
      if (exists) {
        throw new ValidationError('Reserva com este ID já existe', {
          reservationId: reservation.id
        });
      }

      // Adicionar à lista
      serialized.push(this._serializeReservations([reservation])[0]);
      
      // Persistir
      this._saveAllReservations(serialized);

      this.logger.info(`Reserva ${reservation.id} salva com sucesso`);

      return reservation;
    } catch (error) {
      this.logger.error(`Erro ao salvar reserva ${reservation.id}:`, error);
      throw error;
    }
  }

  /**
   * Atualiza uma reserva existente
   * @param {Reservation} reservation - Reserva com dados atualizados
   * @returns {Promise<Reservation>}
   */
  async update(reservation) {
    this.logger.debug(`update chamado para reserva: ${reservation.id}`);

    try {
      // Validar se é uma instância válida
      if (!(reservation instanceof Reservation)) {
        throw new ValidationError('Objeto deve ser uma instância de Reservation');
      }

      const serialized = this._getAllReservations();
      
      // Encontrar índice da reserva
      const index = serialized.findIndex(r => r.id === reservation.id);

      if (index === -1) {
        throw new NotFoundError('Reserva não encontrada para atualização', {
          reservationId: reservation.id
        });
      }

      // Atualizar reserva
      serialized[index] = this._serializeReservations([reservation])[0];
      
      // Persistir
      this._saveAllReservations(serialized);

      this.logger.info(`Reserva ${reservation.id} atualizada com sucesso`);

      return reservation;
    } catch (error) {
      this.logger.error(`Erro ao atualizar reserva ${reservation.id}:`, error);
      throw error;
    }
  }

  /**
   * Remove uma reserva pelo ID
   * @param {string|number} id - ID da reserva
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    this.logger.debug(`delete chamado para id: ${id}`);

    try {
      const serialized = this._getAllReservations();
      
      const index = serialized.findIndex(r => r.id === id);

      if (index === -1) {
        throw new NotFoundError('Reserva não encontrada para remoção', {
          reservationId: id
        });
      }

      // Remover reserva
      serialized.splice(index, 1);
      
      // Persistir
      this._saveAllReservations(serialized);

      this.logger.info(`Reserva ${id} removida com sucesso`);

      return true;
    } catch (error) {
      this.logger.error(`Erro ao remover reserva ${id}:`, error);
      throw error;
    }
  }

  /**
   * Verifica se uma reserva existe
   * @param {string|number} id - ID da reserva
   * @returns {Promise<boolean>}
   */
  async exists(id) {
    this.logger.debug(`exists chamado para id: ${id}`);

    try {
      const serialized = this._getAllReservations();
      return serialized.some(r => r.id === id);
    } catch (error) {
      this.logger.error(`Erro em exists para id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Retorna reservas para um quarto específico
   * @param {string|number} roomId - ID do quarto
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Array<Reservation>>}
   */
  async findByRoomId(roomId, options = {}) {
    this.logger.debug(`findByRoomId chamado para roomId: ${roomId}`);

    try {
      const allReservations = await this.findAll();
      
      const filtered = allReservations.filter(r => r.room.id === roomId);

      return this._applyQueryOptions(filtered, options);
    } catch (error) {
      this.logger.error(`Erro em findByRoomId para roomId ${roomId}:`, error);
      throw error;
    }
  }

  /**
   * Verifica conflito de datas para um quarto
   * @param {string|number} roomId - ID do quarto
   * @param {DateRange} dateRange - Período a verificar
   * @param {string|number} excludeReservationId - ID da reserva a ignorar
   * @returns {Promise<boolean>}
   */
  async hasConflict(roomId, dateRange, excludeReservationId = null) {
    this.logger.debug('hasConflict chamado:', { roomId, dateRange: dateRange.toString() });

    try {
      const allReservations = await this.findAll();
      
      return allReservations.some(res => {
        // Ignorar a própria reserva se estiver sendo editada
        if (excludeReservationId && res.id === excludeReservationId) {
          return false;
        }

        // Ignorar reservas canceladas ou finalizadas
        if (res.status === ReservationStatus.CANCELLED || 
            res.status === ReservationStatus.CHECKED_OUT ||
            res.status === ReservationStatus.NO_SHOW) {
          return false;
        }

        // Verificar se é o mesmo quarto
        if (res.room.id !== roomId) {
          return false;
        }

        // Verificar sobreposição de períodos
        return res.dateRange.overlaps(dateRange);
      });
    } catch (error) {
      this.logger.error('Erro em hasConflict:', error);
      throw error;
    }
  }

  /**
   * Retorna reservas conflitantes para um quarto
   * @param {string|number} roomId - ID do quarto
   * @param {DateRange} dateRange - Período a verificar
   * @param {string|number} excludeReservationId - ID da reserva a ignorar
   * @returns {Promise<Array<Reservation>>}
   */
  async findConflicting(roomId, dateRange, excludeReservationId = null) {
    this.logger.debug('findConflicting chamado:', { roomId, dateRange: dateRange.toString() });

    try {
      const allReservations = await this.findAll();
      
      return allReservations.filter(res => {
        // Ignorar a própria reserva se estiver sendo editada
        if (excludeReservationId && res.id === excludeReservationId) {
          return false;
        }

        // Ignorar reservas canceladas ou finalizadas
        if (res.status === ReservationStatus.CANCELLED || 
            res.status === ReservationStatus.CHECKED_OUT ||
            res.status === ReservationStatus.NO_SHOW) {
          return false;
        }

        // Verificar se é o mesmo quarto
        if (res.room.id !== roomId) {
          return false;
        }

        // Verificar sobreposição de períodos
        return res.dateRange.overlaps(dateRange);
      });
    } catch (error) {
      this.logger.error('Erro em findConflicting:', error);
      throw error;
    }
  }
}