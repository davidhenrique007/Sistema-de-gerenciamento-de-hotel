// ============================================
// ENTIDADE: Service
// ============================================
// Representa serviços adicionais oferecidos pelo hotel
// Ex: Café da manhã, estacionamento, spa, etc
// ============================================

// Importações
import { Money } from '../value-objects/Money.js';
import { ValidationError } from '../../../shared/utils/errorUtils.js';

// ============================================
// ENUM DE TIPOS DE SERVIÇO
// ============================================

export const ServiceType = {
  PER_NIGHT: 'PER_NIGHT',     // Cobrado por noite
  PER_STAY: 'PER_STAY',        // Cobrado uma vez por estadia
  PER_PERSON: 'PER_PERSON',    // Cobrado por pessoa
  PER_PERSON_NIGHT: 'PER_PERSON_NIGHT' // Cobrado por pessoa por noite
};

// ============================================
// CLASSE PRINCIPAL
// ============================================

export class Service {
  /**
   * Cria uma nova instância de Service
   * @param {Object} params - Parâmetros de criação
   * @param {string|number} params.id - Identificador único
   * @param {string} params.name - Nome do serviço
   * @param {string} params.description - Descrição do serviço
   * @param {Money} params.price - Preço do serviço
   * @param {string} params.type - Tipo de cobrança (ServiceType)
   * @param {boolean} params.isOptional - Se é opcional ou obrigatório
   * @param {number} params.maxQuantity - Quantidade máxima (0 = ilimitado)
   * @throws {ValidationError} Quando os parâmetros são inválidos
   */
  constructor({
    id,
    name,
    description = '',
    price,
    type,
    isOptional = true,
    maxQuantity = 0
  }) {
    // Validações obrigatórias
    this._validateRequired(id, 'id');
    this._validateRequired(name, 'name');
    this._validateRequired(price, 'price');
    this._validateRequired(type, 'type');

    // Validações específicas
    this._validateId(id);
    this._validateName(name);
    this._validateDescription(description);
    this._validatePrice(price);
    this._validateType(type);
    this._validateMaxQuantity(maxQuantity);

    // Propriedades privadas
    this._id = id;
    this._name = name;
    this._description = description;
    this._price = price;
    this._type = type;
    this._isOptional = isOptional;
    this._maxQuantity = maxQuantity;

    // Congelar
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
        entity: 'Service',
        field: fieldName
      });
    }
  }

  /**
   * Valida ID do serviço
   * @private
   */
  _validateId(id) {
    if (typeof id !== 'string' && typeof id !== 'number') {
      throw new ValidationError('ID deve ser string ou número', {
        entity: 'Service',
        field: 'id',
        receivedType: typeof id
      });
    }
  }

  /**
   * Valida nome do serviço
   * @private
   */
  _validateName(name) {
    if (typeof name !== 'string') {
      throw new ValidationError('Nome deve ser string', {
        entity: 'Service',
        field: 'name',
        receivedType: typeof name
      });
    }

    if (name.trim().length < 3) {
      throw new ValidationError('Nome deve ter pelo menos 3 caracteres', {
        entity: 'Service',
        field: 'name',
        length: name.length
      });
    }
  }

  /**
   * Valida descrição
   * @private
   */
  _validateDescription(description) {
    if (description && typeof description !== 'string') {
      throw new ValidationError('Descrição deve ser string', {
        entity: 'Service',
        field: 'description',
        receivedType: typeof description
      });
    }
  }

  /**
   * Valida preço
   * @private
   */
  _validatePrice(price) {
    if (!(price instanceof Money)) {
      throw new ValidationError('Preço deve ser uma instância de Money', {
        entity: 'Service',
        field: 'price',
        receivedType: typeof price
      });
    }
  }

  /**
   * Valida tipo de serviço
   * @private
   */
  _validateType(type) {
    if (!Object.values(ServiceType).includes(type)) {
      throw new ValidationError('Tipo de serviço inválido', {
        entity: 'Service',
        field: 'type',
        receivedValue: type,
        validTypes: Object.values(ServiceType)
      });
    }
  }

  /**
   * Valida quantidade máxima
   * @private
   */
  _validateMaxQuantity(maxQuantity) {
    if (typeof maxQuantity !== 'number' || maxQuantity < 0) {
      throw new ValidationError('Quantidade máxima deve ser um número não negativo', {
        entity: 'Service',
        field: 'maxQuantity',
        receivedValue: maxQuantity
      });
    }

    if (!Number.isInteger(maxQuantity)) {
      throw new ValidationError('Quantidade máxima deve ser um número inteiro', {
        entity: 'Service',
        field: 'maxQuantity',
        receivedValue: maxQuantity
      });
    }
  }

  // ============================================
  // GETTERS
  // ============================================

  /** @returns {string|number} ID do serviço */
  get id() { return this._id; }

  /** @returns {string} Nome do serviço */
  get name() { return this._name; }

  /** @returns {string} Descrição do serviço */
  get description() { return this._description; }

  /** @returns {Money} Preço do serviço */
  get price() { return this._price; }

  /** @returns {string} Tipo de cobrança */
  get type() { return this._type; }

  /** @returns {boolean} Se é opcional */
  get isOptional() { return this._isOptional; }

  /** @returns {number} Quantidade máxima (0 = ilimitado) */
  get maxQuantity() { return this._maxQuantity; }

  // ============================================
  // REGRAS DE NEGÓCIO - CÁLCULO DE PREÇO
  // ============================================

  /**
   * Calcula o preço total do serviço
   * @param {Object} params - Parâmetros para cálculo
   * @param {number} params.nights - Número de noites
   * @param {number} params.guests - Número de hóspedes
   * @param {number} params.quantity - Quantidade solicitada
   * @returns {Money} Preço total calculado
   * @throws {ValidationError} Quando os parâmetros são inválidos
   */
  calculatePrice({ nights = 1, guests = 1, quantity = 1 }) {
    // Validar quantidade
    this._validateQuantity(quantity);

    // Calcular baseado no tipo
    let totalPrice;

    switch (this._type) {
      case ServiceType.PER_NIGHT:
        totalPrice = this._price.multiply(nights * quantity);
        break;

      case ServiceType.PER_STAY:
        totalPrice = this._price.multiply(quantity);
        break;

      case ServiceType.PER_PERSON:
        totalPrice = this._price.multiply(guests * quantity);
        break;

      case ServiceType.PER_PERSON_NIGHT:
        totalPrice = this._price.multiply(nights * guests * quantity);
        break;

      default:
        throw new ValidationError('Tipo de serviço não implementado', {
          serviceId: this._id,
          serviceType: this._type
        });
    }

    return totalPrice;
  }

  /**
   * Valida quantidade solicitada
   * @private
   * @param {number} quantity - Quantidade
   * @throws {ValidationError} Quando quantidade é inválida
   */
  _validateQuantity(quantity) {
    if (typeof quantity !== 'number' || quantity < 1) {
      throw new ValidationError('Quantidade deve ser um número positivo', {
        serviceId: this._id,
        receivedQuantity: quantity
      });
    }

    if (!Number.isInteger(quantity)) {
      throw new ValidationError('Quantidade deve ser um número inteiro', {
        serviceId: this._id,
        receivedQuantity: quantity
      });
    }

    if (this._maxQuantity > 0 && quantity > this._maxQuantity) {
      throw new ValidationError(`Quantidade máxima excedida. Máximo: ${this._maxQuantity}`, {
        serviceId: this._id,
        maxQuantity: this._maxQuantity,
        requestedQuantity: quantity
      });
    }
  }

  // ============================================
  // MÉTODOS DE COMPARAÇÃO
  // ============================================

  /**
   * Compara com outro serviço
   * @param {Service} other - Outro serviço
   * @returns {boolean} true se são iguais
   */
  equals(other) {
    if (!(other instanceof Service)) return false;
    return this._id === other._id;
  }

  // ============================================
  // MÉTODOS DE FORMATAÇÃO
  // ============================================

  /**
   * Retorna representação para logging
   * @returns {Object} Objeto com dados do serviço
   */
  toJSON() {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      price: this._price.toJSON(),
      type: this._type,
      isOptional: this._isOptional,
      maxQuantity: this._maxQuantity
    };
  }
}
