// ============================================
// USE CASE: ValidateRoomAvailabilityUseCase
// ============================================
// Responsabilidade: Validar se um quarto está
// disponível para ocupação
// ============================================

// ============================================
// IMPORTAÇÕES
// ============================================
import { AppError, ValidationError, NotFoundError } from '../../../../shared/utils/errorUtils.js';
import { OccupancyStatuses } from '../../../domain/value-objects/OccupancyStatus.js';
import { DateRange } from '../../../domain/value-objects/DateRange.js';

// ============================================
// DTO - DATA TRANSFER OBJECT
// ============================================

/**
 * DTO para retornar resultado da validação
 */
class AvailabilityResultDTO {
  constructor(room, isAvailable, reason = null, context = {}) {
    this.roomId = room.id;
    this.roomNumber = room.number;
    this.roomType = room.type;
    this.isAvailable = isAvailable;
    this.currentStatus = room.status.value;
    this.currentStatusLabel = room.status.label;
    this.reason = reason;
    this.timestamp = new Date().toISOString();
    this.context = context;
  }

  toJSON() {
    return {
      roomId: this.roomId,
      roomNumber: this.roomNumber,
      roomType: this.roomType,
      isAvailable: this.isAvailable,
      currentStatus: this.currentStatus,
      currentStatusLabel: this.currentStatusLabel,
      reason: this.reason,
      timestamp: this.timestamp,
      context: this.context
    };
  }
}

// ============================================
// USE CASE PRINCIPAL
// ============================================

export class ValidateRoomAvailabilityUseCase {
  /**
   * @param {Object} dependencies - Dependências injetadas
   * @param {RoomRepository} dependencies.roomRepository - Repositório de quartos
   * @param {ReservationRepository} dependencies.reservationRepository - Repositório de reservas (opcional)
   * @param {Logger} dependencies.logger - Logger (opcional)
   */
  constructor({ roomRepository, reservationRepository = null, logger = console }) {
    this.roomRepository = roomRepository;
    this.reservationRepository = reservationRepository;
    this.logger = logger;
  }

  /**
   * Executa o caso de uso - validação básica de disponibilidade
   * @param {Object} params - Parâmetros de execução
   * @param {string|number} params.roomId - ID do quarto
   * @returns {Promise<AvailabilityResultDTO>} Resultado da validação
   * @throws {NotFoundError} Quando o quarto não existe
   */
  async execute({ roomId }) {
    try {
      // 1. Validar parâmetros
      this._validateParams({ roomId });

      // 2. Buscar quarto
      const room = await this.roomRepository.findById(roomId);
      
      if (!room) {
        throw new NotFoundError('Quarto não encontrado', {
          roomId,
          entity: 'Room'
        });
      }

      // 3. Validar disponibilidade básica
      const isAvailable = room.isAvailable();
      
      let reason = null;
      if (!isAvailable) {
        reason = `Quarto não está disponível. Status atual: ${room.status.label}`;
      }

      // 4. Log da validação
      this.logger.info(`Availability check for room ${room.number}: ${isAvailable ? 'available' : 'unavailable'}`, {
        roomId: room.id,
        isAvailable,
        currentStatus: room.status.value
      });

      // 5. Retornar resultado
      return new AvailabilityResultDTO(room, isAvailable, reason);
    } catch (error) {
      // Log do erro
      this.logger.error(`Erro ao validar disponibilidade do quarto ${roomId}:`, error);
      
      // Relançar erro padronizado
      throw error;
    }
  }

  /**
   * Validação avançada com período e reservas
   * @param {Object} params - Parâmetros de execução
   * @param {string|number} params.roomId - ID do quarto
   * @param {DateRange} params.dateRange - Período a verificar
   * @param {number} params.guestsCount - Número de hóspedes (opcional)
   * @returns {Promise<AvailabilityResultDTO>} Resultado da validação
   */
  async validateWithPeriod({ roomId, dateRange, guestsCount = null }) {
    try {
      // 1. Validar parâmetros
      this._validateParams({ roomId });
      
      if (!dateRange) {
        throw new ValidationError('Período é obrigatório', {
          field: 'dateRange'
        });
      }

      if (!(dateRange instanceof DateRange)) {
        throw new ValidationError('dateRange deve ser uma instância de DateRange', {
          receivedType: typeof dateRange
        });
      }

      // Validar se o período é válido
      if (!dateRange.isValid()) {
        throw new ValidationError('Período de reserva inválido', {
          checkIn: dateRange.checkIn,
          checkOut: dateRange.checkOut,
          nights: dateRange.getNights()
        });
      }

      // 2. Buscar quarto
      const room = await this.roomRepository.findById(roomId);
      
      if (!room) {
        throw new NotFoundError('Quarto não encontrado', {
          roomId,
          entity: 'Room'
        });
      }

      // 3. Verificar disponibilidade básica
      if (!room.isAvailable()) {
        return new AvailabilityResultDTO(
          room, 
          false, 
          `Quarto não está disponível. Status atual: ${room.status.label}`,
          { dateRange: dateRange.toString() }
        );
      }

      // 4. Verificar capacidade para hóspedes
      if (guestsCount !== null) {
        if (typeof guestsCount !== 'number' || guestsCount < 1) {
          throw new ValidationError('Número de hóspedes deve ser maior que zero', {
            field: 'guestsCount',
            receivedValue: guestsCount
          });
        }

        if (!room.canAccommodate(guestsCount)) {
          return new AvailabilityResultDTO(
            room,
            false,
            `Quarto não comporta ${guestsCount} hóspedes. Capacidade máxima: ${room.capacity}`,
            { guestsCount, maxCapacity: room.capacity, dateRange: dateRange.toString() }
          );
        }
      }

      // 5. Verificar reservas no período (se houver repositório)
      if (this.reservationRepository) {
        const hasConflict = await this._checkReservationConflicts(roomId, dateRange);
        
        if (hasConflict) {
          return new AvailabilityResultDTO(
            room,
            false,
            `Quarto já possui reserva para o período ${dateRange.toString()}`,
            { dateRange: dateRange.toString() }
          );
        }
      }

      // 6. Quarto disponível
      return new AvailabilityResultDTO(room, true, null, {
        dateRange: dateRange.toString(),
        guestsCount
      });
    } catch (error) {
      this.logger.error(`Erro na validação avançada do quarto ${roomId}:`, error);
      throw error;
    }
  }

  /**
   * Valida parâmetros de entrada
   * @private
   */
  _validateParams({ roomId }) {
    if (!roomId) {
      throw new ValidationError('ID do quarto é obrigatório', {
        field: 'roomId'
      });
    }
  }

  /**
   * Verifica conflitos de reserva para o período
   * @private
   */
  async _checkReservationConflicts(roomId, dateRange) {
    try {
      // Buscar reservas para este quarto
      const reservations = await this.reservationRepository.findByRoomId(roomId);

      // Verificar se alguma reserva conflita com o período
      return reservations.some(reservation => {
        // Ignorar reservas canceladas ou finalizadas
        if (reservation.status === 'CANCELLED' || 
            reservation.status === 'CHECKED_OUT' || 
            reservation.status === 'NO_SHOW') {
          return false;
        }

        // Verificar sobreposição de períodos
        return reservation.dateRange.overlaps(dateRange);
      });
    } catch (error) {
      this.logger.warn('Erro ao verificar conflitos de reserva:', error);
      return false; // Assume disponível em caso de erro
    }
  }

  /**
   * Versão para validar múltiplos quartos
   * @param {Array<string|number>} roomIds - Lista de IDs
   * @returns {Promise<Array<AvailabilityResultDTO>>} Resultados
   */
  async validateMany(roomIds) {
    if (!Array.isArray(roomIds)) {
      throw new ValidationError('roomIds deve ser um array');
    }

    const results = [];
    
    for (const roomId of roomIds) {
      try {
        const result = await this.execute({ roomId });
        results.push(result);
      } catch (error) {
        results.push({
          roomId,
          isAvailable: false,
          reason: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    return results;
  }

  /**
   * Versão para validar disponibilidade para check-in
   * @param {string|number} roomId - ID do quarto
   * @returns {Promise<AvailabilityResultDTO>} Resultado
   */
  async validateForCheckIn(roomId) {
    const result = await this.execute({ roomId });

    // Regras específicas para check-in
    if (result.isAvailable) {
      // Quarto disponível pode fazer check-in
      return result;
    }

    // Se não estiver disponível, verificar se está reservado
    const room = await this.roomRepository.findById(roomId);
    
    if (room && room.status.isReserved) {
      // Quarto reservado também pode fazer check-in
      return new AvailabilityResultDTO(
        room,
        true,
        null,
        { note: 'Quarto reservado - check-in permitido' }
      );
    }

    return result;
  }

  /**
   * Versão para verificar disponibilidade para uma reserva específica
   * @param {Object} params - Parâmetros
   * @param {string|number} params.roomId - ID do quarto
   * @param {DateRange} params.dateRange - Período
   * @param {number} params.guestsCount - Número de hóspedes
   * @param {string|number} params.excludeReservationId - ID da reserva a ignorar (para edição)
   * @returns {Promise<AvailabilityResultDTO>} Resultado
   */
  async checkForReservation({ roomId, dateRange, guestsCount, excludeReservationId = null }) {
    try {
      // 1. Validar parâmetros
      this._validateParams({ roomId });
      
      if (!dateRange) {
        throw new ValidationError('Período é obrigatório', {
          field: 'dateRange'
        });
      }

      if (!(dateRange instanceof DateRange)) {
        throw new ValidationError('dateRange deve ser uma instância de DateRange');
      }

      // 2. Buscar quarto
      const room = await this.roomRepository.findById(roomId);
      
      if (!room) {
        throw new NotFoundError('Quarto não encontrado', {
          roomId,
          entity: 'Room'
        });
      }

      // 3. Verificar disponibilidade básica
      if (!room.isAvailable() && !room.status.isReserved) {
        return new AvailabilityResultDTO(
          room, 
          false, 
          `Quarto não está disponível. Status atual: ${room.status.label}`,
          { dateRange: dateRange.toString() }
        );
      }

      // 4. Verificar capacidade
      if (!room.canAccommodate(guestsCount)) {
        return new AvailabilityResultDTO(
          room,
          false,
          `Quarto não comporta ${guestsCount} hóspedes. Capacidade máxima: ${room.capacity}`,
          { guestsCount, maxCapacity: room.capacity }
        );
      }

      // 5. Verificar conflitos com outras reservas
      if (this.reservationRepository) {
        const reservations = await this.reservationRepository.findByRoomId(roomId);
        
        const hasConflict = reservations.some(reservation => {
          // Ignorar a reserva que estamos editando
          if (excludeReservationId && reservation.id === excludeReservationId) {
            return false;
          }

          // Ignorar reservas canceladas ou finalizadas
          if (['CANCELLED', 'CHECKED_OUT', 'NO_SHOW'].includes(reservation.status)) {
            return false;
          }

          return reservation.dateRange.overlaps(dateRange);
        });

        if (hasConflict) {
          return new AvailabilityResultDTO(
            room,
            false,
            `Quarto já possui reserva para o período solicitado`,
            { dateRange: dateRange.toString() }
          );
        }
      }

      // 6. Tudo ok
      return new AvailabilityResultDTO(room, true, null, {
        dateRange: dateRange.toString(),
        guestsCount
      });

    } catch (error) {
      this.logger.error(`Erro ao verificar disponibilidade para reserva:`, error);
      throw error;
    }
  }
}