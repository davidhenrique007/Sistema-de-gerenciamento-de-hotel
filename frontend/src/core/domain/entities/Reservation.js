// ============================================
// ENTIDADE: Reservation (AGREGADO RAIZ)
// ============================================
// Representa uma reserva completa do hotel
// Agrega Room, DateRange, Services e regras de negócio
// ============================================

// Importações
import { Room } from './Room.js';
import { Service } from './Service.js';
import { DateRange } from '../value-objects/DateRange.js';
import { Money, zeroMoney, sumMoney } from '../value-objects/Money.js';
import { ValidationError } from '../../../shared/utils/errorUtils.js';

// ============================================
// ENUM DE STATUS DE RESERVA
// ============================================

export const ReservationStatus = {
  PENDING: 'PENDING',       // Aguardando confirmação
  CONFIRMED: 'CONFIRMED',   // Confirmada
  CHECKED_IN: 'CHECKED_IN', // Hóspede presente
  CHECKED_OUT: 'CHECKED_OUT', // Hóspede saiu
  CANCELLED: 'CANCELLED',   // Cancelada
  NO_SHOW: 'NO_SHOW'        // Não compareceu
};

// ============================================
// CLASSE PRINCIPAL
// ============================================

export class Reservation {
  /**
   * Cria uma nova instância de Reservation
   * @param {Object} params - Parâmetros de criação
   * @param {string|number} params.id - Identificador único
   * @param {Room} params.room - Quarto reservado
   * @param {DateRange} params.dateRange - Período da reserva
   * @param {Object} params.guest - Dados do hóspede
   * @param {string} params.guest.name - Nome do hóspede
   * @param {string} params.guest.email - Email do hóspede
   * @param {string} params.guest.phone - Telefone do hóspede
   * @param {number} params.guestsCount - Número de hóspedes
   * @param {Array<Service>} params.services - Serviços adicionais
   * @param {string} params.status - Status da reserva
   * @param {Date} params.createdAt - Data de criação
   * @param {Date} params.checkedInAt - Data de check-in
   * @param {Date} params.checkedOutAt - Data de check-out
   * @param {Date} params.cancelledAt - Data de cancelamento
   * @throws {ValidationError} Quando os parâmetros são inválidos
   */
  constructor({
    id,
    room,
    dateRange,
    guest,
    guestsCount,
    services = [],
    status = ReservationStatus.PENDING,
    createdAt = new Date(),
    checkedInAt = null,
    checkedOutAt = null,
    cancelledAt = null
  }) {
    // Validações obrigatórias
    this._validateRequired(id, 'id');
    this._validateRequired(room, 'room');
    this._validateRequired(dateRange, 'dateRange');
    this._validateRequired(guest, 'guest');
    this._validateRequired(guestsCount, 'guestsCount');

    // Validações específicas
    this._validateId(id);
    this._validateRoom(room);
    this._validateDateRange(dateRange);
    this._validateGuest(guest);
    this._validateGuestsCount(guestsCount, room);
    this._validateServices(services);
    this._validateStatus(status);

    // Propriedades privadas
    this._id = id;
    this._room = room;
    this._dateRange = dateRange;
    this._guest = { ...guest }; // Cópia para evitar mutação
    this._guestsCount = guestsCount;
    this._services = [...services];
    this._status = status;
    this._createdAt = new Date(createdAt);
    this._checkedInAt = checkedInAt ? new Date(checkedInAt) : null;
    this._checkedOutAt = checkedOutAt ? new Date(checkedOutAt) : null;
    this._cancelledAt = cancelledAt ? new Date(cancelledAt) : null;
    this._totalPrice = this._calculateTotalPrice();

    // Congelar (parcialmente - objetos complexos já são imutáveis)
    Object.freeze(this);
  }

  // ============================================
  // MÉTODOS PRIVADOS DE VALIDAÇÃO
  // ============================================

  /**
   * Valida campo obrigatório
   * @private
   */
  _validateRequired(value, fieldName) {
    if (value === null || value === undefined) {
      throw new ValidationError(`${fieldName} é obrigatório`, {
        entity: 'Reservation',
        field: fieldName
      });
    }
  }

  /**
   * Valida ID da reserva
   * @private
   */
  _validateId(id) {
    if (typeof id !== 'string' && typeof id !== 'number') {
      throw new ValidationError('ID deve ser string ou número', {
        entity: 'Reservation',
        field: 'id',
        receivedType: typeof id
      });
    }
  }

  /**
   * Valida quarto
   * @private
   */
  _validateRoom(room) {
    if (!(room instanceof Room)) {
      throw new ValidationError('room deve ser uma instância de Room', {
        entity: 'Reservation',
        field: 'room',
        receivedType: typeof room
      });
    }
  }

  /**
   * Valida período
   * @private
   */
  _validateDateRange(dateRange) {
    if (!(dateRange instanceof DateRange)) {
      throw new ValidationError('dateRange deve ser uma instância de DateRange', {
        entity: 'Reservation',
        field: 'dateRange',
        receivedType: typeof dateRange
      });
    }

    if (!dateRange.isValid()) {
      throw new ValidationError('Período de reserva inválido', {
        entity: 'Reservation',
        field: 'dateRange',
        nights: dateRange.getNights()
      });
    }
  }

  /**
   * Valida dados do hóspede
   * @private
   */
  _validateGuest(guest) {
    if (typeof guest !== 'object' || guest === null) {
      throw new ValidationError('guest deve ser um objeto', {
        entity: 'Reservation',
        field: 'guest'
      });
    }

    if (!guest.name || typeof guest.name !== 'string' || guest.name.trim() === '') {
      throw new ValidationError('Nome do hóspede é obrigatório', {
        entity: 'Reservation',
        field: 'guest.name'
      });
    }

    if (!guest.email || typeof guest.email !== 'string') {
      throw new ValidationError('Email do hóspede é obrigatório', {
        entity: 'Reservation',
        field: 'guest.email'
      });
    }
  }

  /**
   * Valida número de hóspedes
   * @private
   */
  _validateGuestsCount(guestsCount, room) {
    if (typeof guestsCount !== 'number' || guestsCount < 1) {
      throw new ValidationError('Número de hóspedes deve ser maior que zero', {
        entity: 'Reservation',
        field: 'guestsCount',
        receivedValue: guestsCount
      });
    }

    if (!Number.isInteger(guestsCount)) {
      throw new ValidationError('Número de hóspedes deve ser inteiro', {
        entity: 'Reservation',
        field: 'guestsCount',
        receivedValue: guestsCount
      });
    }

    if (!room.canAccommodate(guestsCount)) {
      throw new ValidationError(`Quarto comporta no máximo ${room.capacity} hóspedes`, {
        entity: 'Reservation',
        field: 'guestsCount',
        roomCapacity: room.capacity,
        requestedGuests: guestsCount
      });
    }
  }

  /**
   * Valida serviços
   * @private
   */
  _validateServices(services) {
    if (!Array.isArray(services)) {
      throw new ValidationError('services deve ser um array', {
        entity: 'Reservation',
        field: 'services'
      });
    }

    for (const service of services) {
      if (!(service instanceof Service)) {
        throw new ValidationError('Cada serviço deve ser instância de Service', {
          entity: 'Reservation',
          field: 'services',
          receivedType: typeof service
        });
      }
    }
  }

  /**
   * Valida status
   * @private
   */
  _validateStatus(status) {
    if (!Object.values(ReservationStatus).includes(status)) {
      throw new ValidationError('Status de reserva inválido', {
        entity: 'Reservation',
        field: 'status',
        receivedValue: status,
        validStatuses: Object.values(ReservationStatus)
      });
    }
  }

  /**
   * Calcula preço total
   * @private
   * @returns {Money} Preço total
   */
  _calculateTotalPrice() {
    const amounts = [];

    // Preço do quarto
    const roomTotal = this._room.pricePerNight.multiply(this._dateRange.getNights());
    amounts.push(roomTotal);

    // Preço dos serviços
    for (const service of this._services) {
      const serviceTotal = service.calculatePrice({
        nights: this._dateRange.getNights(),
        guests: this._guestsCount,
        quantity: 1
      });
      amounts.push(serviceTotal);
    }

    return sumMoney(amounts);
  }

  // ============================================
  // GETTERS
  // ============================================

  /** @returns {string|number} ID da reserva */
  get id() { return this._id; }

  /** @returns {Room} Quarto reservado */
  get room() { return this._room; }

  /** @returns {DateRange} Período da reserva */
  get dateRange() { return this._dateRange; }

  /** @returns {Object} Dados do hóspede (cópia) */
  get guest() { return { ...this._guest }; }

  /** @returns {number} Número de hóspedes */
  get guestsCount() { return this._guestsCount; }

  /** @returns {Array<Service>} Cópia dos serviços */
  get services() { return [...this._services]; }

  /** @returns {string} Status atual */
  get status() { return this._status; }

  /** @returns {Date} Data de criação */
  get createdAt() { return new Date(this._createdAt); }

  /** @returns {Date|null} Data de check-in */
  get checkedInAt() { return this._checkedInAt ? new Date(this._checkedInAt) : null; }

  /** @returns {Date|null} Data de check-out */
  get checkedOutAt() { return this._checkedOutAt ? new Date(this._checkedOutAt) : null; }

  /** @returns {Date|null} Data de cancelamento */
  get cancelledAt() { return this._cancelledAt ? new Date(this._cancelledAt) : null; }

  /** @returns {Money} Preço total */
  get totalPrice() { return this._totalPrice; }

  // ============================================
  // REGRAS DE NEGÓCIO - MUDANÇAS DE STATUS (IMUTÁVEIS)
  // ============================================

  /**
   * Confirma a reserva - retorna NOVA instância
   * @returns {Reservation} Nova reserva com status CONFIRMED
   * @throws {ValidationError} Quando não é possível confirmar
   */
  confirm() {
    if (this._status !== ReservationStatus.PENDING) {
      throw new ValidationError('Apenas reservas pendentes podem ser confirmadas', {
        reservationId: this._id,
        currentStatus: this._status
      });
    }

    // Retorna uma nova instância com o status alterado
    return new Reservation({
      id: this._id,
      room: this._room,
      dateRange: this._dateRange,
      guest: this._guest,
      guestsCount: this._guestsCount,
      services: this._services,
      status: ReservationStatus.CONFIRMED,
      createdAt: this._createdAt,
      checkedInAt: this._checkedInAt,
      checkedOutAt: this._checkedOutAt,
      cancelledAt: this._cancelledAt
    });
  }

  /**
   * Realiza check-in - retorna NOVA instância
   * @returns {Reservation} Nova reserva com status CHECKED_IN
   * @throws {ValidationError} Quando não é possível fazer check-in
   */
  checkIn() {
    if (this._status !== ReservationStatus.CONFIRMED) {
      throw new ValidationError('Apenas reservas confirmadas podem fazer check-in', {
        reservationId: this._id,
        currentStatus: this._status
      });
    }

    if (!this._dateRange.isCurrent() && !this._dateRange.isFuture()) {
      throw new ValidationError('Check-in só pode ser feito no período da reserva', {
        reservationId: this._id,
        dateRange: this._dateRange.toString()
      });
    }

    // Ocupar o quarto
    this._room.occupy(this._guestsCount, this._id);

    // Retorna nova instância
    return new Reservation({
      id: this._id,
      room: this._room,
      dateRange: this._dateRange,
      guest: this._guest,
      guestsCount: this._guestsCount,
      services: this._services,
      status: ReservationStatus.CHECKED_IN,
      createdAt: this._createdAt,
      checkedInAt: new Date(),
      checkedOutAt: this._checkedOutAt,
      cancelledAt: this._cancelledAt
    });
  }

  /**
   * Realiza check-out - retorna NOVA instância
   * @returns {Reservation} Nova reserva com status CHECKED_OUT
   * @throws {ValidationError} Quando não é possível fazer check-out
   */
  checkOut() {
    if (this._status !== ReservationStatus.CHECKED_IN) {
      throw new ValidationError('Apenas reservas com check-in podem fazer check-out', {
        reservationId: this._id,
        currentStatus: this._status
      });
    }

    // Liberar o quarto
    this._room.release();

    // Retorna nova instância
    return new Reservation({
      id: this._id,
      room: this._room,
      dateRange: this._dateRange,
      guest: this._guest,
      guestsCount: this._guestsCount,
      services: this._services,
      status: ReservationStatus.CHECKED_OUT,
      createdAt: this._createdAt,
      checkedInAt: this._checkedInAt,
      checkedOutAt: new Date(),
      cancelledAt: this._cancelledAt
    });
  }

  /**
   * Cancela a reserva - retorna NOVA instância
   * @returns {Reservation} Nova reserva com status CANCELLED
   * @throws {ValidationError} Quando não é possível cancelar
   */
  cancel() {
    if ([ReservationStatus.CHECKED_OUT, ReservationStatus.CANCELLED].includes(this._status)) {
      throw new ValidationError('Reserva não pode ser cancelada', {
        reservationId: this._id,
        currentStatus: this._status
      });
    }

    // Retorna nova instância
    return new Reservation({
      id: this._id,
      room: this._room,
      dateRange: this._dateRange,
      guest: this._guest,
      guestsCount: this._guestsCount,
      services: this._services,
      status: ReservationStatus.CANCELLED,
      createdAt: this._createdAt,
      checkedInAt: this._checkedInAt,
      checkedOutAt: this._checkedOutAt,
      cancelledAt: new Date()
    });
  }

  // ============================================
  // REGRAS DE NEGÓCIO - MODIFICAÇÕES (IMUTÁVEIS)
  // ============================================

  /**
   * Adiciona um serviço à reserva - retorna NOVA instância
   * @param {Service} service - Serviço a adicionar
   * @returns {Reservation} Nova reserva com serviço adicionado
   * @throws {ValidationError} Quando não é possível adicionar
   */
  addService(service) {
    if (this._status !== ReservationStatus.PENDING && 
        this._status !== ReservationStatus.CONFIRMED) {
      throw new ValidationError('Serviços só podem ser adicionados em reservas pendentes ou confirmadas', {
        reservationId: this._id,
        currentStatus: this._status
      });
    }

    if (!(service instanceof Service)) {
      throw new ValidationError('Serviço deve ser instância de Service');
    }

    // Verificar se já existe
    const exists = this._services.some(s => s.id === service.id);
    if (exists) {
      throw new ValidationError('Serviço já adicionado à reserva', {
        reservationId: this._id,
        serviceId: service.id
      });
    }

    // Retorna nova instância com serviços atualizados
    return new Reservation({
      id: this._id,
      room: this._room,
      dateRange: this._dateRange,
      guest: this._guest,
      guestsCount: this._guestsCount,
      services: [...this._services, service],
      status: this._status,
      createdAt: this._createdAt,
      checkedInAt: this._checkedInAt,
      checkedOutAt: this._checkedOutAt,
      cancelledAt: this._cancelledAt
    });
  }

  /**
   * Remove um serviço da reserva - retorna NOVA instância
   * @param {string|number} serviceId - ID do serviço
   * @returns {Reservation} Nova reserva sem o serviço
   * @throws {ValidationError} Quando não é possível remover
   */
  removeService(serviceId) {
    if (this._status !== ReservationStatus.PENDING) {
      throw new ValidationError('Serviços só podem ser removidos em reservas pendentes', {
        reservationId: this._id,
        currentStatus: this._status
      });
    }

    const newServices = this._services.filter(s => s.id !== serviceId);

    if (newServices.length === this._services.length) {
      throw new ValidationError('Serviço não encontrado na reserva', {
        reservationId: this._id,
        serviceId
      });
    }

    // Retorna nova instância com serviços atualizados
    return new Reservation({
      id: this._id,
      room: this._room,
      dateRange: this._dateRange,
      guest: this._guest,
      guestsCount: this._guestsCount,
      services: newServices,
      status: this._status,
      createdAt: this._createdAt,
      checkedInAt: this._checkedInAt,
      checkedOutAt: this._checkedOutAt,
      cancelledAt: this._cancelledAt
    });
  }

  // ============================================
  // REGRAS DE NEGÓCIO - VALIDAÇÕES
  // ============================================

  /**
   * Verifica se a reserva está ativa
   * @returns {boolean} true se ativa
   */
  isActive() {
    return [ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN].includes(this._status);
  }

  /**
   * Verifica se a reserva pode ser modificada
   * @returns {boolean} true se pode ser modificada
   */
  isModifiable() {
    return this._status === ReservationStatus.PENDING;
  }

  /**
   * Verifica se a reserva pode ser cancelada
   * @returns {boolean} true se pode ser cancelada
   */
  isCancellable() {
    return ![ReservationStatus.CHECKED_OUT, ReservationStatus.CANCELLED].includes(this._status);
  }

  // ============================================
  // MÉTODOS DE COMPARAÇÃO
  // ============================================

  /**
   * Compara com outra reserva
   * @param {Reservation} other - Outra reserva
   * @returns {boolean} true se são iguais
   */
  equals(other) {
    if (!(other instanceof Reservation)) return false;
    return this._id === other._id;
  }

  // ============================================
  // MÉTODOS DE FORMATAÇÃO
  // ============================================

  /**
   * Retorna representação para logging
   * @returns {Object} Objeto com dados da reserva
   */
  toJSON() {
    return {
      id: this._id,
      room: this._room.toJSON(),
      dateRange: this._dateRange.toJSON(),
      guest: this._guest,
      guestsCount: this._guestsCount,
      services: this._services.map(s => s.toJSON()),
      status: this._status,
      totalPrice: this._totalPrice.toJSON(),
      createdAt: this._createdAt.toISOString(),
      checkedInAt: this._checkedInAt?.toISOString() || null,
      checkedOutAt: this._checkedOutAt?.toISOString() || null,
      cancelledAt: this._cancelledAt?.toISOString() || null
    };
  }
}