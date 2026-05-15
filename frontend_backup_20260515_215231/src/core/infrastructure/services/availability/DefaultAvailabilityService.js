// ============================================
// SERVICE: DefaultAvailabilityService
// ============================================
// Responsabilidade: Centralizar verificação de disponibilidade de quartos
// Padrões: Service Layer, Strategy Pattern
// ============================================

// ============================================
// IMPORTAÇÕES
// ============================================
import { DateRange } from '../../../domain/value-objects/DateRange.js';
import { ReservationStatus } from '../../../domain/entities/Reservation.js';
import { AppError, ValidationError, NotFoundError } from '../../../../shared/utils/errorUtils.js';
import { createLogger } from '../../../utils.js';

// ============================================
// DTOs - DATA TRANSFER OBJECTS
// ============================================

/**
 * DTO para resultado de disponibilidade
 */
export class AvailabilityResult {
  constructor({
    isAvailable,
    room,
    dateRange,
    conflicts = [],
    reason = null,
    alternatives = []
  }) {
    this.isAvailable = isAvailable;
    this.roomId = room?.id;
    this.roomNumber = room?.number;
    this.roomType = room?.type;
    this.checkIn = dateRange?.checkIn.toISOString().split('T')[0];
    this.checkOut = dateRange?.checkOut.toISOString().split('T')[0];
    this.nights = dateRange?.getNights();
    this.conflicts = conflicts;
    this.reason = reason;
    this.alternatives = alternatives;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      isAvailable: this.isAvailable,
      roomId: this.roomId,
      roomNumber: this.roomNumber,
      roomType: this.roomType,
      checkIn: this.checkIn,
      checkOut: this.checkOut,
      nights: this.nights,
      conflicts: this.conflicts,
      reason: this.reason,
      alternatives: this.alternatives,
      timestamp: this.timestamp
    };
  }
}

// ============================================
// SERVIÇO PRINCIPAL
// ============================================

export class DefaultAvailabilityService {
  /**
   * @param {Object} dependencies - Dependências injetadas
   * @param {IRoomRepository} dependencies.roomRepository - Repositório de quartos
   * @param {IReservationRepository} dependencies.reservationRepository - Repositório de reservas
   * @param {Object} dependencies.logger - Logger (opcional)
   */
  constructor({ 
    roomRepository, 
    reservationRepository,
    logger = createLogger('DefaultAvailabilityService')
  }) {
    this.roomRepository = roomRepository;
    this.reservationRepository = reservationRepository;
    this.logger = logger;
  }

  /**
   * Verifica disponibilidade de um quarto
   * @param {Object} params - Parâmetros
   * @param {string|number} params.roomId - ID do quarto
   * @param {DateRange} params.dateRange - Período a verificar
   * @param {number} params.guestsCount - Número de hóspedes (opcional)
   * @param {string|number} params.excludeReservationId - ID da reserva a ignorar (para edição)
   * @returns {Promise<AvailabilityResult>} Resultado da verificação
   */
  async checkAvailability({ roomId, dateRange, guestsCount = null, excludeReservationId = null }) {
    const startTime = Date.now();

    try {
      // 1. Validar parâmetros
      this._validateParams({ roomId, dateRange, guestsCount });

      // 2. Buscar quarto
      const room = await this._findRoom(roomId);

      // 3. Verificar disponibilidade básica do quarto
      const basicAvailability = this._checkBasicAvailability(room);
      if (!basicAvailability.isAvailable) {
        return this._buildResult(false, room, dateRange, basicAvailability.reason);
      }

      // 4. Verificar capacidade (se solicitado)
      if (guestsCount) {
        const capacityCheck = this._checkCapacity(room, guestsCount);
        if (!capacityCheck.isAvailable) {
          return this._buildResult(false, room, dateRange, capacityCheck.reason);
        }
      }

      // 5. Verificar conflitos com reservas existentes
      const conflicts = await this._findConflicts(roomId, dateRange, excludeReservationId);
      
      if (conflicts.length > 0) {
        // 6. Buscar alternativas (quartos similares disponíveis)
        const alternatives = await this._findAlternatives(room, dateRange, guestsCount, excludeReservationId);
        
        return this._buildResult(
          false, 
          room, 
          dateRange, 
          'Quarto já reservado para este período',
          conflicts,
          alternatives
        );
      }

      // 7. Log de sucesso
      const duration = Date.now() - startTime;
      this.logger.info('Availability check successful', {
        roomId: room.id,
        dateRange: dateRange.toString(),
        guests: guestsCount,
        duration: `${duration}ms`
      });

      // 8. Quarto disponível
      return this._buildResult(true, room, dateRange);

    } catch (error) {
      this.logger.error('Error checking availability:', {
        error: error.message,
        stack: error.stack,
        roomId,
        dateRange: dateRange?.toString()
      });
      throw error;
    }
  }

  /**
   * Valida parâmetros de entrada
   * @private
   */
  _validateParams({ roomId, dateRange, guestsCount }) {
    if (!roomId) {
      throw new ValidationError('ID do quarto é obrigatório');
    }

    if (!dateRange) {
      throw new ValidationError('Período é obrigatório');
    }

    if (!(dateRange instanceof DateRange)) {
      throw new ValidationError('dateRange deve ser uma instância de DateRange');
    }

    if (!dateRange.isValid()) {
      throw new ValidationError('Período inválido', {
        nights: dateRange.getNights()
      });
    }

    if (guestsCount !== null && (typeof guestsCount !== 'number' || guestsCount < 1)) {
      throw new ValidationError('Número de hóspedes deve ser maior que zero');
    }
  }

  /**
   * Busca quarto no repositório
   * @private
   */
  async _findRoom(roomId) {
    const room = await this.roomRepository.findById(roomId);
    
    if (!room) {
      throw new NotFoundError('Quarto não encontrado', {
        roomId,
        entity: 'Room'
      });
    }

    return room;
  }

  /**
   * Verifica disponibilidade básica do quarto
   * @private
   */
  _checkBasicAvailability(room) {
    if (!room.isAvailable()) {
      return {
        isAvailable: false,
        reason: `Quarto não está disponível. Status atual: ${room.status.label}`
      };
    }

    if (!room.status.allowsReservation) {
      return {
        isAvailable: false,
        reason: `Quarto não permite reserva no momento. Status: ${room.status.label}`
      };
    }

    return { isAvailable: true };
  }

  /**
   * Verifica capacidade do quarto
   * @private
   */
  _checkCapacity(room, guestsCount) {
    if (!room.canAccommodate(guestsCount)) {
      return {
        isAvailable: false,
        reason: `Quarto comporta no máximo ${room.capacity} hóspedes`
      };
    }

    return { isAvailable: true };
  }

  /**
   * Busca conflitos de reserva
   * @private
   */
  async _findConflicts(roomId, dateRange, excludeReservationId) {
    const conflicts = await this.reservationRepository.findConflicting(
      roomId, 
      dateRange, 
      excludeReservationId
    );

    return conflicts.map(conflict => ({
      id: conflict.id,
      checkIn: conflict.dateRange.checkIn.toISOString().split('T')[0],
      checkOut: conflict.dateRange.checkOut.toISOString().split('T')[0],
      status: conflict.status,
      guestsCount: conflict.guestsCount
    }));
  }

  /**
   * Busca quartos alternativos disponíveis
   * @private
   */
  async _findAlternatives(originalRoom, dateRange, guestsCount, excludeReservationId) {
    try {
      // Buscar todos os quartos do mesmo tipo
      const similarRooms = await this.roomRepository.findByType(originalRoom.type);
      
      const alternatives = [];
      
      for (const room of similarRooms) {
        // Ignorar o próprio quarto
        if (room.id === originalRoom.id) continue;

        // Verificar disponibilidade básica
        if (!room.isAvailable() || !room.status.allowsReservation) continue;

        // Verificar capacidade
        if (guestsCount && !room.canAccommodate(guestsCount)) continue;

        // Verificar conflitos
        const conflicts = await this.reservationRepository.findConflicting(
          room.id, 
          dateRange, 
          excludeReservationId
        );

        if (conflicts.length === 0) {
          alternatives.push({
            id: room.id,
            number: room.number,
            type: room.type,
            capacity: room.capacity,
            pricePerNight: room.pricePerNight.amount,
            pricePerNightFormatted: room.pricePerNight.toString()
          });
        }
      }

      return alternatives;
    } catch (error) {
      this.logger.warn('Erro ao buscar alternativas:', error);
      return [];
    }
  }

  /**
   * Constrói resultado da verificação
   * @private
   */
  _buildResult(isAvailable, room, dateRange, reason = null, conflicts = [], alternatives = []) {
    return new AvailabilityResult({
      isAvailable,
      room,
      dateRange,
      conflicts,
      reason,
      alternatives
    });
  }

  /**
   * Verifica disponibilidade de múltiplos quartos
   * @param {Array<Object>} requests - Lista de requisições
   * @returns {Promise<Array<AvailabilityResult>>} Resultados
   */
  async checkBulkAvailability(requests) {
    const results = [];
    
    for (const request of requests) {
      try {
        const result = await this.checkAvailability(request);
        results.push(result);
      } catch (error) {
        results.push({
          isAvailable: false,
          roomId: request.roomId,
          reason: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    return results;
  }

  /**
   * Retorna próximos períodos disponíveis para um quarto
   * @param {string|number} roomId - ID do quarto
   * @param {Date} fromDate - Data inicial
   * @param {number} nights - Número de noites desejado
   * @param {number} limit - Limite de opções
   * @returns {Promise<Array<Object>>} Períodos disponíveis
   */
  async findNextAvailable(roomId, fromDate, nights, limit = 5) {
    try {
      const room = await this._findRoom(roomId);
      
      if (!room.isAvailable() || !room.status.allowsReservation) {
        return [];
      }

      const options = [];
      let currentDate = new Date(fromDate);
      
      while (options.length < limit) {
        const checkOut = new Date(currentDate);
        checkOut.setDate(checkOut.getDate() + nights);
        
        const dateRange = new DateRange(currentDate, checkOut);
        
        const conflicts = await this.reservationRepository.findConflicting(roomId, dateRange);
        
        if (conflicts.length === 0) {
          options.push({
            checkIn: currentDate.toISOString().split('T')[0],
            checkOut: checkOut.toISOString().split('T')[0],
            nights
          });
        }
        
        // Avançar para o próximo dia
        currentDate.setDate(currentDate.getDate() + 1);
        
        // Evitar loop infinito
        if (options.length === 0 && currentDate > new Date(fromDate.getTime() + (90 * 24 * 60 * 60 * 1000))) {
          break;
        }
      }

      return options;
    } catch (error) {
      this.logger.error('Erro ao buscar próximos períodos:', error);
      return [];
    }
  }

  /**
   * Verifica disponibilidade para uma reserva específica (considerando estado atual)
   * @param {Reservation} reservation - Reserva a verificar
   * @returns {Promise<boolean>} true se disponível
   */
  async checkForReservation(reservation) {
    return this.checkAvailability({
      roomId: reservation.room.id,
      dateRange: reservation.dateRange,
      guestsCount: reservation.guestsCount,
      excludeReservationId: reservation.id
    });
  }
}