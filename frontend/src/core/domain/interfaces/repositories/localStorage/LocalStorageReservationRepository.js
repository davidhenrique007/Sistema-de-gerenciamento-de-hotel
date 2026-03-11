// ============================================
// REPOSITORY: LocalStorageReservationRepository
// ============================================
// Responsabilidade: Implementação concreta do repositório de reservas
// usando localStorage como mecanismo de persistência
// Padrões: Repository Pattern, Adapter Pattern
// ============================================

// ============================================
// IMPORTAÇÕES
// ============================================
import { IReservationRepository } from '../../../domain/interfaces/repositories/IReservationRepository.js';
import { Reservation, ReservationStatus } from '../../../domain/entities/Reservation.js';
import { Room } from '../../../domain/entities/Room.js';
import { Service } from '../../../domain/entities/Service.js';
import { DateRange } from '../../../domain/value-objects/DateRange.js';
import { Money } from '../../../domain/value-objects/Money.js';
import { OccupancyStatuses } from '../../../domain/value-objects/OccupancyStatus.js';
import { 
  AppError, 
  NotFoundError, 
  ValidationError, 
  ConflictError 
} from '../../../../shared/utils/errorUtils.js';
import { storage } from '../../../../shared/utils/storage.js';
import { createLogger } from '../../../utils.js';

// ============================================
// CONSTANTES
// ============================================
const STORAGE_KEY = 'hotel_paradise_reservations';
const DEFAULT_LOGGER = createLogger('LocalStorageReservationRepository');

// ============================================
// DADOS MOCK PARA INICIALIZAÇÃO
// ============================================
import { roomsData } from '../../../../data/roomsData.js';
import { servicesData } from '../../../../data/servicesData.js';

// ============================================
// REPOSITÓRIO PRINCIPAL
// ============================================

export class LocalStorageReservationRepository extends IReservationRepository {
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
    super();
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
        this.logger.info('Inicializando dados mock de reservas...');
        
        // Criar algumas reservas mock
        const mockReservations = this._createMockReservations();
        
        // Salvar no storage
        this.storage.setItem(STORAGE_KEY, this._serializeReservations(mockReservations));
        
        this.logger.info(`${mockReservations.length} reservas inicializadas com sucesso`);
      }
    } catch (error) {
      this.logger.error('Erro ao inicializar dados mock:', error);
    }
  }

  /**
   * Cria reservas mock para inicialização
   * @private
   */
  _createMockReservations() {
    // Esta função precisaria dos repositórios para buscar quartos e serviços
    // Como é apenas para inicialização, retornamos array vazio por enquanto
    // Em uma implementação real, você pode criar reservas mock manualmente
    return [];
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
  // MÉTODOS PÚBLICOS - IMPLEMENTAÇÃO DA INTERFACE
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

      // Verificar conflito de datas
      const hasConflict = this._checkDateConflict(
        serialized.map(r => ({ ...r, room: { id: r.roomId } })),
        reservation.room.id,
        reservation.dateRange
      );

      if (hasConflict) {
        throw new ConflictError('Já existe uma reserva para este período', {
          roomId: reservation.room.id,
          dateRange: reservation.dateRange.toString()
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

      // Verificar conflito de datas (excluindo a própria reserva)
      const hasConflict = this._checkDateConflict(
        serialized.map(r => ({ ...r, room: { id: r.roomId } })),
        reservation.room.id,
        reservation.dateRange,
        reservation.id
      );

      if (hasConflict) {
        throw new ConflictError('Já existe uma reserva para este período', {
          roomId: reservation.room.id,
          dateRange: reservation.dateRange.toString()
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

      // Verificar se pode ser removida (não está ativa)
      const reservation = await this._deserializeReservation(serialized[index]);
      
      if (reservation.isActive()) {
        throw new ValidationError('Não é possível remover uma reserva ativa', {
          reservationId: id,
          status: reservation.status
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
   * Retorna reservas para um período específico
   * @param {DateRange} dateRange - Período a ser consultado
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Array<Reservation>>}
   */
  async findByDateRange(dateRange, options = {}) {
    this.logger.debug('findByDateRange chamado:', { dateRange: dateRange.toString() });

    try {
      const allReservations = await this.findAll();
      
      const filtered = allReservations.filter(reservation => {
        // Filtrar por período
        const overlaps = reservation.dateRange.overlaps(dateRange);
        
        if (!overlaps) {
          return false;
        }

        // Filtrar canceladas se necessário
        if (!options.includeCancelled && reservation.status === ReservationStatus.CANCELLED) {
          return false;
        }

        return true;
      });

      return this._applyQueryOptions(filtered, options);
    } catch (error) {
      this.logger.error('Erro em findByDateRange:', error);
      throw error;
    }
  }

  /**
   * Retorna reservas por status
   * @param {string} status - Status da reserva
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Array<Reservation>>}
   */
  async findByStatus(status, options = {}) {
    this.logger.debug(`findByStatus chamado para status: ${status}`);

    try {
      // Validar status
      if (!Object.values(ReservationStatus).includes(status)) {
        throw new ValidationError('Status de reserva inválido', {
          receivedStatus: status,
          validStatuses: Object.values(ReservationStatus)
        });
      }

      const allReservations = await this.findAll();
      
      const filtered = allReservations.filter(r => r.status === status);

      return this._applyQueryOptions(filtered, options);
    } catch (error) {
      this.logger.error(`Erro em findByStatus para status ${status}:`, error);
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
   * Retorna reservas para um hóspede específico
   * @param {string} guestEmail - Email do hóspede
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Array<Reservation>>}
   */
  async findByGuestEmail(guestEmail, options = {}) {
    this.logger.debug(`findByGuestEmail chamado para email: ${guestEmail}`);

    try {
      const allReservations = await this.findAll();
      
      const filtered = allReservations.filter(r => 
        r.guest.email.toLowerCase() === guestEmail.toLowerCase()
      );

      return this._applyQueryOptions(filtered, options);
    } catch (error) {
      this.logger.error(`Erro em findByGuestEmail para email ${guestEmail}:`, error);
      throw error;
    }
  }

  /**
   * Retorna reservas ativas (confirmadas ou check-in realizado)
   * @returns {Promise<Array<Reservation>>}
   */
  async findActive() {
    this.logger.debug('findActive chamado');

    try {
      const allReservations = await this.findAll();
      
      return allReservations.filter(r => r.isActive());
    } catch (error) {
      this.logger.error('Erro em findActive:', error);
      throw error;
    }
  }

  /**
   * Retorna reservas futuras (a partir de hoje)
   * @returns {Promise<Array<Reservation>>}
   */
  async findUpcoming() {
    this.logger.debug('findUpcoming chamado');

    try {
      const allReservations = await this.findAll();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return allReservations.filter(r => 
        r.dateRange.checkIn >= today && 
        r.status !== ReservationStatus.CANCELLED &&
        r.status !== ReservationStatus.CHECKED_OUT
      );
    } catch (error) {
      this.logger.error('Erro em findUpcoming:', error);
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
      const serialized = this._getAllReservations();
      
      return this._checkDateConflict(
        serialized.map(r => ({ ...r, room: { id: r.roomId } })),
        roomId,
        dateRange,
        excludeReservationId
      );
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

  /**
   * Retorna estatísticas de reservas
   * @param {Object} period - Período para estatísticas
   * @returns {Promise<Object>}
   */
  async getStatistics(period = null) {
    this.logger.debug('getStatistics chamado');

    try {
      const allReservations = await this.findAll();
      
      // Filtrar por período se fornecido
      let filteredReservations = allReservations;
      if (period) {
        const periodRange = new DateRange(period.start, period.end);
        filteredReservations = allReservations.filter(r => 
          r.dateRange.overlaps(periodRange)
        );
      }

      // Calcular estatísticas
      const total = filteredReservations.length;
      const confirmed = filteredReservations.filter(r => r.status === ReservationStatus.CONFIRMED).length;
      const checkedIn = filteredReservations.filter(r => r.status === ReservationStatus.CHECKED_IN).length;
      const checkedOut = filteredReservations.filter(r => r.status === ReservationStatus.CHECKED_OUT).length;
      const cancelled = filteredReservations.filter(r => r.status === ReservationStatus.CANCELLED).length;
      
      const totalRevenue = filteredReservations
        .filter(r => r.status !== ReservationStatus.CANCELLED)
        .reduce((sum, r) => sum + r.totalPrice.amount, 0);

      const averageNights = filteredReservations.length > 0
        ? filteredReservations.reduce((sum, r) => sum + r.dateRange.getNights(), 0) / filteredReservations.length
        : 0;

      return {
        period: period ? { start: period.start, end: period.end } : null,
        total,
        byStatus: {
          confirmed,
          checkedIn,
          checkedOut,
          cancelled
        },
        totalRevenue,
        averageNights,
        occupancyRate: this._calculateOccupancyRate(filteredReservations, period)
      };
    } catch (error) {
      this.logger.error('Erro em getStatistics:', error);
      throw error;
    }
  }

  /**
   * Calcula taxa de ocupação
   * @private
   */
  _calculateOccupancyRate(reservations, period) {
    if (!period) return null;

    const totalDays = Math.ceil((period.end - period.start) / (1000 * 60 * 60 * 24));
    if (totalDays <= 0) return 0;

    // Simplificação: assume que cada reserva ocupa todos os dias do período
    // Em uma implementação real, você calcularia dias ocupados por quarto
    const occupiedDays = reservations.reduce((sum, r) => {
      const overlapStart = new Date(Math.max(r.dateRange.checkIn, period.start));
      const overlapEnd = new Date(Math.min(r.dateRange.checkOut, period.end));
      const overlapDays = Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24));
      return sum + Math.max(0, overlapDays);
    }, 0);

    return (occupiedDays / totalDays) * 100;
  }

  /**
   * Cancela uma reserva
   * @param {string|number} id - ID da reserva
   * @returns {Promise<Reservation>}
   */
  async cancel(id) {
    this.logger.debug(`cancel chamado para id: ${id}`);

    try {
      const reservation = await this.findById(id);
      
      if (!reservation) {
        throw new NotFoundError('Reserva não encontrada', { reservationId: id });
      }

      const cancelledReservation = reservation.cancel();
      
      return await this.update(cancelledReservation);
    } catch (error) {
      this.logger.error(`Erro ao cancelar reserva ${id}:`, error);
      throw error;
    }
  }

  /**
   * Confirma uma reserva
   * @param {string|number} id - ID da reserva
   * @returns {Promise<Reservation>}
   */
  async confirm(id) {
    this.logger.debug(`confirm chamado para id: ${id}`);

    try {
      const reservation = await this.findById(id);
      
      if (!reservation) {
        throw new NotFoundError('Reserva não encontrada', { reservationId: id });
      }

      const confirmedReservation = reservation.confirm();
      
      return await this.update(confirmedReservation);
    } catch (error) {
      this.logger.error(`Erro ao confirmar reserva ${id}:`, error);
      throw error;
    }
  }

  /**
   * Realiza check-in de uma reserva
   * @param {string|number} id - ID da reserva
   * @returns {Promise<Reservation>}
   */
  async checkIn(id) {
    this.logger.debug(`checkIn chamado para id: ${id}`);

    try {
      const reservation = await this.findById(id);
      
      if (!reservation) {
        throw new NotFoundError('Reserva não encontrada', { reservationId: id });
      }

      const checkedInReservation = reservation.checkIn();
      
      return await this.update(checkedInReservation);
    } catch (error) {
      this.logger.error(`Erro ao fazer check-in da reserva ${id}:`, error);
      throw error;
    }
  }

  /**
   * Realiza check-out de uma reserva
   * @param {string|number} id - ID da reserva
   * @returns {Promise<Reservation>}
   */
  async checkOut(id) {
    this.logger.debug(`checkOut chamado para id: ${id}`);

    try {
      const reservation = await this.findById(id);
      
      if (!reservation) {
        throw new NotFoundError('Reserva não encontrada', { reservationId: id });
      }

      const checkedOutReservation = reservation.checkOut();
      
      return await this.update(checkedOutReservation);
    } catch (error) {
      this.logger.error(`Erro ao fazer check-out da reserva ${id}:`, error);
      throw error;
    }
  }

  /**
   * Retorna reservas entre duas datas
   * @param {Date} startDate - Data inicial
   * @param {Date} endDate - Data final
   * @returns {Promise<Array<Reservation>>}
   */
  async findBetweenDates(startDate, endDate) {
    this.logger.debug('findBetweenDates chamado:', { startDate, endDate });

    try {
      const dateRange = new DateRange(startDate, endDate);
      return this.findByDateRange(dateRange);
    } catch (error) {
      this.logger.error('Erro em findBetweenDates:', error);
      throw error;
    }
  }

  /**
   * Retorna reservas para uma data específica
   * @param {Date} date - Data a consultar
   * @returns {Promise<Array<Reservation>>}
   */
  async findByDate(date) {
    this.logger.debug('findByDate chamado:', { date });

    try {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      return this.findBetweenDates(startDate, endDate);
    } catch (error) {
      this.logger.error('Erro em findByDate:', error);
      throw error;
    }
  }

  /**
   * Retorna reservas por tipo de quarto
   * @param {string} roomType - Tipo do quarto
   * @returns {Promise<Array<Reservation>>}
   */
  async findByRoomType(roomType) {
    this.logger.debug(`findByRoomType chamado para tipo: ${roomType}`);

    try {
      const allReservations = await this.findAll();
      
      return allReservations.filter(r => 
        r.room.type.toLowerCase() === roomType.toLowerCase()
      );
    } catch (error) {
      this.logger.error(`Erro em findByRoomType para tipo ${roomType}:`, error);
      throw error;
    }
  }
}