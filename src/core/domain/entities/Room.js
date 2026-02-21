// ============================================
// ENTIDADE: Room
// ============================================
// Representa um quarto do hotel com suas regras de negócio
// Encapsula capacidade, ocupação e status
// ============================================

// Importações dos Value Objects
import { OccupancyStatus, OccupancyStatuses } from '../value-objects/OccupancyStatus.js';
import { Money } from '../value-objects/Money.js';
import { ValidationError } from '../../../shared/utils/errorUtils.js';

// ============================================
// CLASSE PRINCIPAL
// ============================================

export class Room {
  /**
   * Cria uma nova instância de Room
   * @param {Object} params - Parâmetros de criação
   * @param {string|number} params.id - Identificador único do quarto
   * @param {string} params.number - Número do quarto
   * @param {string} params.type - Tipo de quarto (standard, deluxe, etc)
   * @param {number} params.capacity - Capacidade máxima de hóspedes
   * @param {Money} params.pricePerNight - Preço por noite
   * @param {OccupancyStatus} params.status - Status atual de ocupação
   * @param {Array<string>} params.amenities - Comodidades do quarto
   * @throws {ValidationError} Quando os parâmetros são inválidos
   */
  constructor({
    id,
    number,
    type,
    capacity,
    pricePerNight,
    status = OccupancyStatuses.AVAILABLE,
    amenities = []
  }) {
    // Validações obrigatórias
    this._validateRequired(id, 'id');
    this._validateRequired(number, 'number');
    this._validateRequired(type, 'type');
    this._validateRequired(capacity, 'capacity');
    this._validateRequired(pricePerNight, 'pricePerNight');

    // Validações de tipo e regras
    this._validateId(id);
    this._validateNumber(number);
    this._validateType(type);
    this._validateCapacity(capacity);
    this._validatePrice(pricePerNight);
    this._validateStatus(status);
    this._validateAmenities(amenities);

    // Propriedades privadas
    this._id = id;
    this._number = number;
    this._type = type;
    this._capacity = capacity;
    this._pricePerNight = pricePerNight;
    this._status = status;
    this._amenities = [...amenities]; // Cópia para evitar mutação externa
    this._currentGuests = 0;
    this._currentReservationId = null;

    // Congelar para garantir imutabilidade
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
        entity: 'Room',
        field: fieldName
      });
    }
  }

  /**
   * Valida ID do quarto
   * @private
   */
  _validateId(id) {
    if (typeof id !== 'string' && typeof id !== 'number') {
      throw new ValidationError('ID deve ser string ou número', {
        entity: 'Room',
        field: 'id',
        receivedType: typeof id
      });
    }
  }

  /**
   * Valida número do quarto
   * @private
   */
  _validateNumber(number) {
    if (typeof number !== 'string') {
      throw new ValidationError('Número do quarto deve ser string', {
        entity: 'Room',
        field: 'number',
        receivedType: typeof number
      });
    }

    if (number.trim().length === 0) {
      throw new ValidationError('Número do quarto não pode ser vazio', {
        entity: 'Room',
        field: 'number'
      });
    }
  }

  /**
   * Valida tipo do quarto
   * @private
   */
  _validateType(type) {
    const validTypes = ['standard', 'deluxe', 'executive', 'family', 'presidential'];
    
    if (!validTypes.includes(type.toLowerCase())) {
      throw new ValidationError('Tipo de quarto inválido', {
        entity: 'Room',
        field: 'type',
        receivedValue: type,
        validTypes
      });
    }
  }

  /**
   * Valida capacidade do quarto
   * @private
   */
  _validateCapacity(capacity) {
    if (typeof capacity !== 'number' || isNaN(capacity) || capacity < 1) {
      throw new ValidationError('Capacidade deve ser um número maior que zero', {
        entity: 'Room',
        field: 'capacity',
        receivedValue: capacity
      });
    }

    if (!Number.isInteger(capacity)) {
      throw new ValidationError('Capacidade deve ser um número inteiro', {
        entity: 'Room',
        field: 'capacity',
        receivedValue: capacity
      });
    }
  }

  /**
   * Valida preço do quarto
   * @private
   */
  _validatePrice(price) {
    if (!(price instanceof Money)) {
      throw new ValidationError('Preço deve ser uma instância de Money', {
        entity: 'Room',
        field: 'pricePerNight',
        receivedType: typeof price
      });
    }
  }

  /**
   * Valida status do quarto
   * @private
   */
  _validateStatus(status) {
    if (!(status instanceof OccupancyStatus)) {
      throw new ValidationError('Status deve ser uma instância de OccupancyStatus', {
        entity: 'Room',
        field: 'status',
        receivedType: typeof status
      });
    }
  }

  /**
   * Valida comodidades do quarto
   * @private
   */
  _validateAmenities(amenities) {
    if (!Array.isArray(amenities)) {
      throw new ValidationError('Comodidades deve ser um array', {
        entity: 'Room',
        field: 'amenities',
        receivedType: typeof amenities
      });
    }

    for (const amenity of amenities) {
      if (typeof amenity !== 'string') {
        throw new ValidationError('Cada comodidade deve ser uma string', {
          entity: 'Room',
          field: 'amenities',
          receivedValue: amenity
        });
      }
    }
  }

  // ============================================
  // GETTERS
  // ============================================

  /** @returns {string|number} ID do quarto */
  get id() { return this._id; }

  /** @returns {string} Número do quarto */
  get number() { return this._number; }

  /** @returns {string} Tipo do quarto */
  get type() { return this._type; }

  /** @returns {number} Capacidade máxima */
  get capacity() { return this._capacity; }

  /** @returns {Money} Preço por noite */
  get pricePerNight() { return this._pricePerNight; }

  /** @returns {OccupancyStatus} Status atual */
  get status() { return this._status; }

  /** @returns {Array<string>} Cópia das comodidades */
  get amenities() { return [...this._amenities]; }

  /** @returns {number} Número atual de hóspedes */
  get currentGuests() { return this._currentGuests; }

  /** @returns {string|null} ID da reserva atual */
  get currentReservationId() { return this._currentReservationId; }

  // ============================================
  // REGRAS DE NEGÓCIO - OCUPAÇÃO (IMUTÁVEIS)
  // ============================================

  /**
   * Ocupa o quarto com um número de hóspedes
   * @param {number} guests - Número de hóspedes
   * @param {string} reservationId - ID da reserva
   * @returns {Room} Nova instância do quarto ocupado
   * @throws {ValidationError} Quando não é possível ocupar
   */
  occupy(guests, reservationId) {
    // Validar se pode ocupar
    if (!this._status.allowsCheckIn) {
      throw new ValidationError('Não é possível ocupar este quarto no status atual', {
        roomNumber: this._number,
        currentStatus: this._status.value
      });
    }

    // Validar capacidade
    if (!this.canAccommodate(guests)) {
      throw new ValidationError(`Capacidade máxima excedida. Máximo: ${this._capacity}`, {
        roomNumber: this._number,
        capacity: this._capacity,
        requestedGuests: guests
      });
    }

    // Validar se já está ocupado
    if (this._status.isOccupied) {
      throw new ValidationError('Quarto já está ocupado', {
        roomNumber: this._number
      });
    }

    // Retornar nova instância com status atualizado
    return new Room({
      id: this._id,
      number: this._number,
      type: this._type,
      capacity: this._capacity,
      pricePerNight: this._pricePerNight,
      status: OccupancyStatuses.OCCUPIED,
      amenities: this._amenities
    });
  }

  /**
   * Libera o quarto (check-out)
   * @returns {Room} Nova instância do quarto liberado
   * @throws {ValidationError} Quando não é possível liberar
   */
  release() {
    if (!this._status.isOccupied && !this._status.isReserved) {
      throw new ValidationError('Apenas quartos ocupados ou reservados podem ser liberados', {
        roomNumber: this._number,
        currentStatus: this._status.value
      });
    }

    return new Room({
      id: this._id,
      number: this._number,
      type: this._type,
      capacity: this._capacity,
      pricePerNight: this._pricePerNight,
      status: OccupancyStatuses.AVAILABLE,
      amenities: this._amenities
    });
  }

  /**
   * Coloca o quarto em manutenção
   * @returns {Room} Nova instância do quarto em manutenção
   * @throws {ValidationError} Quando não é possível colocar em manutenção
   */
  setMaintenance() {
    if (!this._status.canTransitionTo(OccupancyStatuses.MAINTENANCE.value)) {
      throw new ValidationError('Não é possível colocar este quarto em manutenção', {
        roomNumber: this._number,
        currentStatus: this._status.value
      });
    }

    return new Room({
      id: this._id,
      number: this._number,
      type: this._type,
      capacity: this._capacity,
      pricePerNight: this._pricePerNight,
      status: OccupancyStatuses.MAINTENANCE,
      amenities: this._amenities
    });
  }

  /**
   * Reserva o quarto
   * @param {string} reservationId - ID da reserva
   * @returns {Room} Nova instância do quarto reservado
   * @throws {ValidationError} Quando não é possível reservar
   */
  reserve(reservationId) {
    if (!this._status.allowsReservation) {
      throw new ValidationError('Este quarto não está disponível para reserva', {
        roomNumber: this._number,
        currentStatus: this._status.value
      });
    }

    return new Room({
      id: this._id,
      number: this._number,
      type: this._type,
      capacity: this._capacity,
      pricePerNight: this._pricePerNight,
      status: OccupancyStatuses.RESERVED,
      amenities: this._amenities
    });
  }

  // ============================================
  // REGRAS DE NEGÓCIO - CAPACIDADE
  // ============================================

  /**
   * Verifica se comporta determinado número de hóspedes
   * @param {number} guests - Número de hóspedes
   * @returns {boolean} true se comporta
   */
  canAccommodate(guests) {
    if (typeof guests !== 'number' || guests < 1) {
      return false;
    }
    return guests <= this._capacity;
  }

  /**
   * Retorna a capacidade restante
   * @returns {number} Vagas restantes
   */
  get availableSpots() {
    return this._capacity - this._currentGuests;
  }

  // ============================================
  // REGRAS DE NEGÓCIO - DISPONIBILIDADE
  // ============================================

  /**
   * Verifica se está disponível para reserva
   * @returns {boolean} true se disponível
   */
  isAvailable() {
    return this._status.isAvailable;
  }

  /**
   * Verifica se está ocupado
   * @returns {boolean} true se ocupado
   */
  isOccupied() {
    return this._status.isOccupied;
  }

  /**
   * Verifica se está em manutenção
   * @returns {boolean} true se em manutenção
   */
  isUnderMaintenance() {
    return this._status.isUnderMaintenance;
  }

  /**
   * Verifica se está reservado
   * @returns {boolean} true se reservado
   */
  isReserved() {
    return this._status.isReserved;
  }

  // ============================================
  // MÉTODOS DE COMPARAÇÃO
  // ============================================

  /**
   * Compara com outro quarto
   * @param {Room} other - Outro quarto
   * @returns {boolean} true se são iguais
   */
  equals(other) {
    if (!(other instanceof Room)) return false;
    return this._id === other._id;
  }

  // ============================================
  // MÉTODOS DE FORMATAÇÃO
  // ============================================

  /**
   * Retorna representação para logging
   * @returns {Object} Objeto com dados do quarto
   */
  toJSON() {
    return {
      id: this._id,
      number: this._number,
      type: this._type,
      capacity: this._capacity,
      pricePerNight: this._pricePerNight.toJSON(),
      status: this._status.toJSON(),
      amenities: this._amenities,
      currentGuests: this._currentGuests,
      currentReservationId: this._currentReservationId
    };
  }
}