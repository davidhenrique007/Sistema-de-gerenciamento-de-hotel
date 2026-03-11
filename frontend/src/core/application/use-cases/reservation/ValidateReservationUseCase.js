// ============================================
// USE CASE: ValidateReservationUseCase
// ============================================
// Responsabilidade: Validar reserva completa
// antes de efetuar pagamento
// ============================================

// ============================================
// IMPORTAÇÕES
// ============================================
import { AppError, ValidationError, NotFoundError } from '../../../../shared/utils/errorUtils.js';
import { DateRange } from '../../../domain/value-objects/DateRange.js';

// ============================================
// DTO - DATA TRANSFER OBJECT
// ============================================

/**
 * DTO para resultado da validação
 */
class ValidationResultDTO {
  constructor({
    isValid,
    room,
    dateRange,
    guestsCount,
    services = [],
    errors = [],
    warnings = [],
    metadata = {}
  }) {
    this.isValid = isValid;
    this.roomId = room?.id;
    this.roomNumber = room?.number;
    this.roomType = room?.type;
    this.checkIn = dateRange?.checkIn.toISOString().split('T')[0];
    this.checkOut = dateRange?.checkOut.toISOString().split('T')[0];
    this.nights = dateRange?.getNights();
    this.guestsCount = guestsCount;
    this.services = services.map(s => ({
      id: s.id,
      name: s.name
    }));
    this.errors = errors;
    this.warnings = warnings;
    this.timestamp = new Date().toISOString();
    this.metadata = metadata;
  }

  toJSON() {
    return {
      isValid: this.isValid,
      roomId: this.roomId,
      roomNumber: this.roomNumber,
      roomType: this.roomType,
      checkIn: this.checkIn,
      checkOut: this.checkOut,
      nights: this.nights,
      guestsCount: this.guestsCount,
      services: this.services,
      errors: this.errors,
      warnings: this.warnings,
      timestamp: this.timestamp,
      metadata: this.metadata
    };
  }
}

// ============================================
// USE CASE PRINCIPAL
// ============================================

export class ValidateReservationUseCase {
  /**
   * @param {Object} dependencies - Dependências injetadas
   * @param {RoomRepository} dependencies.roomRepository - Repositório de quartos
   * @param {ServiceRepository} dependencies.serviceRepository - Repositório de serviços
   * @param {ReservationRepository} dependencies.reservationRepository - Repositório de reservas
   * @param {Logger} dependencies.logger - Logger (opcional)
   */
  constructor({ 
    roomRepository, 
    serviceRepository, 
    reservationRepository,
    logger = console 
  }) {
    this.roomRepository = roomRepository;
    this.serviceRepository = serviceRepository;
    this.reservationRepository = reservationRepository;
    this.logger = logger;
  }

  /**
   * Executa o caso de uso - validação completa
   * @param {Object} params - Parâmetros de execução
   * @param {string|number} params.roomId - ID do quarto
   * @param {DateRange} params.dateRange - Período da reserva
   * @param {number} params.guestsCount - Número de hóspedes
   * @param {Array<string|number>} params.serviceIds - IDs dos serviços selecionados
   * @param {Object} params.options - Opções adicionais
   * @returns {Promise<ValidationResultDTO>} Resultado da validação
   */
  async execute({ roomId, dateRange, guestsCount, serviceIds = [], options = {} }) {
    const errors = [];
    const warnings = [];
    const metadata = {};

    try {
      // 1. Validar parâmetros básicos
      this._validateBasicParams({ roomId, dateRange, guestsCount, serviceIds });

      // 2. Buscar quarto - DEFINIR A VARIÁVEL room AQUI
      const room = await this.roomRepository.findById(roomId);
      
      if (!room) {
        errors.push(this._createError('ROOM_NOT_FOUND', 'Quarto não encontrado', { roomId }));
        return this._buildResult(false, null, dateRange, guestsCount, [], errors, warnings, metadata);
      }

      metadata.roomType = room.type;
      metadata.roomCapacity = room.capacity;

      // 3. Validar datas
      this._validateDates(dateRange, errors, warnings);

      // 4. Validar disponibilidade do quarto
      this._validateRoomAvailability(room, errors, warnings);

      // 5. Validar capacidade
      this._validateCapacity(room, guestsCount, errors, warnings);

      // 6. Buscar e validar serviços (opcional - não deve invalidar a reserva)
      const services = await this._validateServices(serviceIds, warnings);

      // 7. Verificar conflitos com reservas existentes
      await this._checkReservationConflicts(roomId, dateRange, errors, warnings);

      // 8. Verificar políticas
      this._checkPolicies(dateRange, guestsCount, warnings);

      // 9. Determinar se é válido
      const isValid = errors.length === 0;

      // 10. Log da validação
      this.logger.info(`Reservation validation for room ${room.number}: ${isValid ? 'valid' : 'invalid'}`, {
        roomId: room.id,
        isValid,
        errorsCount: errors.length,
        warningsCount: warnings.length
      });

      return this._buildResult(isValid, room, dateRange, guestsCount, services, errors, warnings, metadata);
    } catch (error) {
      this.logger.error('Error validating reservation:', error);
      
      errors.push(this._createError(
        'VALIDATION_EXCEPTION',
        error.message,
        { originalError: error.toString() }
      ));

      return this._buildResult(false, null, dateRange, guestsCount, [], errors, warnings, metadata);
    }
  }

  /**
   * Valida parâmetros básicos
   * @private
   */
  _validateBasicParams({ roomId, dateRange, guestsCount, serviceIds }) {
    if (!roomId) {
      throw new ValidationError('ID do quarto é obrigatório');
    }

    if (!dateRange) {
      throw new ValidationError('Período da reserva é obrigatório');
    }

    if (!(dateRange instanceof DateRange)) {
      throw new ValidationError('dateRange deve ser uma instância de DateRange');
    }

    if (!guestsCount || typeof guestsCount !== 'number' || guestsCount < 1) {
      throw new ValidationError('Número de hóspedes deve ser maior que zero');
    }

    if (serviceIds && !Array.isArray(serviceIds)) {
      throw new ValidationError('serviceIds deve ser um array');
    }
  }

  /**
   * Valida datas da reserva
   * @private
   */
  _validateDates(dateRange, errors, warnings) {
    if (!dateRange.isValid()) {
      errors.push(this._createError(
        'INVALID_DATE_RANGE',
        'Período de reserva inválido',
        { nights: dateRange.getNights() }
      ));
      return;
    }

    if (dateRange.getNights() < 1) {
      errors.push(this._createError(
        'MINIMUM_NIGHTS',
        'Reserva deve ter pelo menos 1 noite',
        { nights: dateRange.getNights() }
      ));
    }

    // Verificar se a data é futura (apenas warning)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dateRange.checkIn < today) {
      warnings.push(this._createWarning(
        'PAST_DATE',
        'Data da reserva é no passado',
        { checkIn: dateRange.checkIn }
      ));
    }
  }

  /**
   * Valida disponibilidade do quarto
   * @private
   */
  _validateRoomAvailability(room, errors, warnings) {
    // Quarto disponível é válido
    if (room.isAvailable()) {
      return; // ✅ Tudo ok
    }

    // Se não estiver disponível, verificar casos especiais
    if (room.status.isReserved) {
      warnings.push(this._createWarning(
        'ROOM_RESERVED',
        'Quarto está reservado para outro período',
        { status: room.status.value, statusLabel: room.status.label }
      ));
    } else {
      errors.push(this._createError(
        'ROOM_NOT_AVAILABLE',
        'Quarto não está disponível',
        { status: room.status.value, statusLabel: room.status.label }
      ));
    }

    // Verificar se permite reserva
    if (!room.status.allowsReservation) {
      errors.push(this._createError(
        'RESERVATION_NOT_ALLOWED',
        'Quarto não permite reserva no momento',
        { status: room.status.value, statusLabel: room.status.label }
      ));
    }
  }

  /**
   * Valida capacidade do quarto
   * @private
   */
  _validateCapacity(room, guestsCount, errors, warnings) {
    if (!room.canAccommodate(guestsCount)) {
      errors.push(this._createError(
        'CAPACITY_EXCEEDED',
        `Quarto comporta no máximo ${room.capacity} hóspedes`,
        { roomCapacity: room.capacity, requestedGuests: guestsCount }
      ));
    } else if (guestsCount < room.capacity) {
      warnings.push(this._createWarning(
        'UNDER_UTILIZED',
        `Quarto tem capacidade para ${room.capacity} hóspedes, mas apenas ${guestsCount} foram informados`,
        { roomCapacity: room.capacity, requestedGuests: guestsCount }
      ));
    }
  }

  /**
   * Valida serviços selecionados (apenas warnings, não erros)
   * @private
   */
  async _validateServices(serviceIds, warnings) {
    if (!serviceIds || serviceIds.length === 0) {
      return [];
    }

    const services = [];

    for (const serviceId of serviceIds) {
      const service = await this.serviceRepository.findById(serviceId);
      
      if (!service) {
        warnings.push(this._createWarning(
          'SERVICE_NOT_FOUND',
          `Serviço com ID ${serviceId} não encontrado`,
          { serviceId }
        ));
        continue;
      }

      services.push(service);
    }

    return services;
  }

  /**
   * Verifica conflitos com reservas existentes
   * @private
   */
  async _checkReservationConflicts(roomId, dateRange, errors, warnings) {
    try {
      if (!this.reservationRepository) {
        return;
      }

      const existingReservations = await this.reservationRepository.findByRoomId(roomId);

      const conflictingReservations = existingReservations.filter(reservation => {
        // Ignorar reservas canceladas ou finalizadas
        if (['CANCELLED', 'CHECKED_OUT', 'NO_SHOW'].includes(reservation.status)) {
          return false;
        }

        return reservation.dateRange.overlaps(dateRange);
      });

      if (conflictingReservations.length > 0) {
        errors.push(this._createError(
          'DATE_CONFLICT',
          'Quarto já possui reserva para este período',
          {
            conflictingReservations: conflictingReservations.map(r => ({
              id: r.id,
              checkIn: r.dateRange.checkIn.toISOString().split('T')[0],
              checkOut: r.dateRange.checkOut.toISOString().split('T')[0],
              status: r.status
            }))
          }
        ));
      }
    } catch (error) {
      this.logger.warn('Erro ao verificar conflitos de reserva:', error);
      warnings.push(this._createWarning(
        'CONFLICT_CHECK_FAILED',
        'Não foi possível verificar conflitos de reserva',
        { error: error.message }
      ));
    }
  }

  /**
   * Verifica políticas da reserva (apenas warnings)
   * @private
   */
  _checkPolicies(dateRange, guestsCount, warnings) {
    const nights = dateRange.getNights();

    if (nights < 2) {
      warnings.push(this._createWarning(
        'SHORT_STAY',
        'Estadias de 1 noite podem ter disponibilidade limitada',
        { nights }
      ));
    }

    if (nights > 30) {
      warnings.push(this._createWarning(
        'LONG_STAY',
        'Estadias muito longas podem exigir confirmação adicional',
        { nights }
      ));
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const daysUntilCheckIn = Math.ceil((dateRange.checkIn - today) / (1000 * 60 * 60 * 24));

    if (daysUntilCheckIn < 1) {
      warnings.push(this._createWarning(
        'CHECK_IN_TOO_SOON',
        'Check-in deve ser agendado com pelo menos 1 dia de antecedência',
        { daysUntilCheckIn }
      ));
    }
  }

  /**
   * Cria objeto de erro padronizado
   * @private
   */
  _createError(code, message, context = {}) {
    return {
      code,
      message,
      severity: 'error',
      context,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Cria objeto de warning padronizado
   * @private
   */
  _createWarning(code, message, context = {}) {
    return {
      code,
      message,
      severity: 'warning',
      context,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Constrói resultado da validação
   * @private
   */
  _buildResult(isValid, room, dateRange, guestsCount, services, errors, warnings, metadata = {}) {
    return new ValidationResultDTO({
      isValid,
      room,
      dateRange,
      guestsCount,
      services,
      errors,
      warnings,
      metadata
    });
  }

  /**
   * Versão rápida para verificar disponibilidade
   */
  async quickCheck(roomId, checkIn, checkOut, guestsCount) {
    const dateRange = new DateRange(checkIn, checkOut);
    
    return this.execute({
      roomId,
      dateRange,
      guestsCount,
      serviceIds: []
    });
  }

  /**
   * Verifica se uma reserva pode ser modificada
   */
  async canModify(reservationId, newDateRange, newGuestsCount) {
    try {
      if (!this.reservationRepository) {
        return {
          canModify: false,
          reason: 'Repositório de reservas não disponível'
        };
      }

      const reservation = await this.reservationRepository.findById(reservationId);
      
      if (!reservation) {
        return {
          canModify: false,
          reason: 'Reserva não encontrada'
        };
      }

      if (!reservation.isModifiable()) {
        return {
          canModify: false,
          reason: `Reserva não pode ser modificada no status ${reservation.status}`
        };
      }

      const validation = await this.execute({
        roomId: reservation.room.id,
        dateRange: newDateRange || reservation.dateRange,
        guestsCount: newGuestsCount || reservation.guestsCount,
        serviceIds: reservation.services.map(s => s.id)
      });

      return {
        canModify: validation.isValid,
        validation
      };
    } catch (error) {
      this.logger.error('Erro ao verificar modificação de reserva:', error);
      return {
        canModify: false,
        reason: error.message
      };
    }
  }
}