// ============================================
// VALUE OBJECT: OccupancyStatus
// ============================================
// Representa o status de ocupação de um quarto
// Imutável e semanticamente claro
// ============================================

// Importações
import { ValidationError } from '../../../shared/utils/errorUtils.js';

// ============================================
// CONSTANTES - DEFINIÇÃO DOS STATUS
// ============================================

/**
 * Enum de status de ocupação
 * @readonly
 * @enum {string}
 */
export const OccupancyStatusEnum = {
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  MAINTENANCE: 'MAINTENANCE',
  RESERVED: 'RESERVED',
  CLEANING: 'CLEANING'
};

// ============================================
// METADADOS DOS STATUS
// ============================================

/**
 * Metadados para cada status (labels, cores, descrições)
 * Sem dependência de UI, apenas dados puros
 */
const StatusMetadata = {
  [OccupancyStatusEnum.AVAILABLE]: {
    label: 'Disponível',
    description: 'Quarto livre para reserva',
    color: '#28a745', // Verde (apenas referência, não é CSS)
    severity: 'success',
    allowsReservation: true,
    allowsCheckIn: true,
    icon: 'check-circle'
  },
  [OccupancyStatusEnum.OCCUPIED]: {
    label: 'Ocupado',
    description: 'Quarto com hóspedes',
    color: '#dc3545', // Vermelho
    severity: 'danger',
    allowsReservation: false,
    allowsCheckIn: false,
    icon: 'user'
  },
  [OccupancyStatusEnum.MAINTENANCE]: {
    label: 'Manutenção',
    description: 'Quarto em manutenção',
    color: '#ffc107', // Amarelo
    severity: 'warning',
    allowsReservation: false,
    allowsCheckIn: false,
    icon: 'tool'
  },
  [OccupancyStatusEnum.RESERVED]: {
    label: 'Reservado',
    description: 'Quarto reservado',
    color: '#17a2b8', // Azul
    severity: 'info',
    allowsReservation: false,
    allowsCheckIn: true,
    icon: 'calendar'
  },
  [OccupancyStatusEnum.CLEANING]: {
    label: 'Limpeza',
    description: 'Quarto em limpeza',
    color: '#6c757d', // Cinza
    severity: 'secondary',
    allowsReservation: false,
    allowsCheckIn: false,
    icon: 'broom'
  }
};

// ============================================
// CLASSE PRINCIPAL
// ============================================

export class OccupancyStatus {
  /**
   * Cria uma nova instância de OccupancyStatus
   * @param {string} status - Status do enum OccupancyStatusEnum
   * @throws {ValidationError} Quando o status é inválido
   */
  constructor(status) {
    this._validateStatus(status);

    this._status = status;
    this._metadata = StatusMetadata[status];

    // Congelar a instância
    Object.freeze(this);
  }

  // ============================================
  // MÉTODOS PRIVADOS
  // ============================================

  /**
   * Valida o status
   * @private
   * @param {string} status - Status a ser validado
   * @throws {ValidationError} Quando o status é inválido
   */
  _validateStatus(status) {
    if (!status) {
      throw new ValidationError('Status é obrigatório', {
        field: 'occupancyStatus'
      });
    }

    if (!Object.values(OccupancyStatusEnum).includes(status)) {
      throw new ValidationError(`Status inválido: ${status}`, {
        field: 'occupancyStatus',
        validStatuses: Object.values(OccupancyStatusEnum)
      });
    }
  }

  // ============================================
  // GETTERS
  // ============================================

  /**
   * Retorna o código do status
   * @returns {string} Código do status
   */
  get value() {
    return this._status;
  }

  /**
   * Retorna o label amigável do status
   * @returns {string} Label para exibição
   */
  get label() {
    return this._metadata.label;
  }

  /**
   * Retorna a descrição do status
   * @returns {string} Descrição detalhada
   */
  get description() {
    return this._metadata.description;
  }

  /**
   * Retorna a cor de referência (para uso em UI)
   * @returns {string} Código hexadecimal da cor
   */
  get color() {
    return this._metadata.color;
  }

  /**
   * Retorna a severidade (para componentes de UI)
   * @returns {string} Severidade (success, danger, warning, info, secondary)
   */
  get severity() {
    return this._metadata.severity;
  }

  /**
   * Retorna o nome do ícone (para uso com bibliotecas de ícones)
   * @returns {string} Nome do ícone
   */
  get icon() {
    return this._metadata.icon;
  }

  // ============================================
  // REGRAS DE NEGÓCIO
  // ============================================

  /**
   * Verifica se permite reservas
   * @returns {boolean} true se permite reserva
   */
  get allowsReservation() {
    return this._metadata.allowsReservation;
  }

  /**
   * Verifica se permite check-in
   * @returns {boolean} true se permite check-in
   */
  get allowsCheckIn() {
    return this._metadata.allowsCheckIn;
  }

  /**
   * Verifica se o quarto está disponível
   * @returns {boolean} true se disponível
   */
  get isAvailable() {
    return this._status === OccupancyStatusEnum.AVAILABLE;
  }

  /**
   * Verifica se o quarto está ocupado
   * @returns {boolean} true se ocupado
   */
  get isOccupied() {
    return this._status === OccupancyStatusEnum.OCCUPIED;
  }

  /**
   * Verifica se o quarto está em manutenção
   * @returns {boolean} true se em manutenção
   */
  get isUnderMaintenance() {
    return this._status === OccupancyStatusEnum.MAINTENANCE;
  }

  /**
   * Verifica se o quarto está reservado
   * @returns {boolean} true se reservado
   */
  get isReserved() {
    return this._status === OccupancyStatusEnum.RESERVED;
  }

  /**
   * Verifica se o quarto está em limpeza
   * @returns {boolean} true se em limpeza
   */
  get isCleaning() {
    return this._status === OccupancyStatusEnum.CLEANING;
  }

  // ============================================
  // TRANSIÇÕES DE ESTADO
  // ============================================

  /**
   * Verifica se é possível transicionar para outro status
   * @param {OccupancyStatus|string} newStatus - Novo status desejado
   * @returns {boolean} true se a transição é válida
   */
  canTransitionTo(newStatus) {
    const targetStatus = newStatus instanceof OccupancyStatus 
      ? newStatus.value 
      : newStatus;

    // Regras de transição de estado
    const allowedTransitions = {
      [OccupancyStatusEnum.AVAILABLE]: [
        OccupancyStatusEnum.RESERVED,
        OccupancyStatusEnum.OCCUPIED,
        OccupancyStatusEnum.MAINTENANCE,
        OccupancyStatusEnum.CLEANING
      ],
      [OccupancyStatusEnum.RESERVED]: [
        OccupancyStatusEnum.OCCUPIED,
        OccupancyStatusEnum.AVAILABLE,
        OccupancyStatusEnum.MAINTENANCE
      ],
      [OccupancyStatusEnum.OCCUPIED]: [
        OccupancyStatusEnum.AVAILABLE,
        OccupancyStatusEnum.CLEANING,
        OccupancyStatusEnum.MAINTENANCE
      ],
      [OccupancyStatusEnum.CLEANING]: [
        OccupancyStatusEnum.AVAILABLE,
        OccupancyStatusEnum.OCCUPIED,
        OccupancyStatusEnum.MAINTENANCE
      ],
      [OccupancyStatusEnum.MAINTENANCE]: [
        OccupancyStatusEnum.AVAILABLE,
        OccupancyStatusEnum.CLEANING
      ]
    };

    return allowedTransitions[this._status]?.includes(targetStatus) || false;
  }

  // ============================================
  // MÉTODOS DE COMPARAÇÃO
  // ============================================

  /**
   * Compara com outro OccupancyStatus
   * @param {OccupancyStatus} other - Outro status
   * @returns {boolean} true se são iguais
   */
  equals(other) {
    if (!(other instanceof OccupancyStatus)) return false;
    return this._status === other._status;
  }

  // ============================================
  // MÉTODOS DE FORMATAÇÃO
  // ============================================

  /**
   * Retorna representação string
   * @returns {string} Label do status
   */
  toString() {
    return this.label;
  }

  /**
   * Retorna representação para logging
   * @returns {Object} Objeto com dados do status
   */
  toJSON() {
    return {
      value: this._status,
      label: this.label,
      description: this.description,
      severity: this.severity
    };
  }
}

// ============================================
// INSTÂNCIAS PRÉ-CONFIGURADAS
// ============================================

// Singleton instances for each status (reutilizáveis)
export const OccupancyStatuses = {
  AVAILABLE: new OccupancyStatus(OccupancyStatusEnum.AVAILABLE),
  OCCUPIED: new OccupancyStatus(OccupancyStatusEnum.OCCUPIED),
  MAINTENANCE: new OccupancyStatus(OccupancyStatusEnum.MAINTENANCE),
  RESERVED: new OccupancyStatus(OccupancyStatusEnum.RESERVED),
  CLEANING: new OccupancyStatus(OccupancyStatusEnum.CLEANING)
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Retorna todos os status disponíveis
 * @returns {Array} Lista de todos os status
 */
export const getAllStatuses = () => {
  return Object.values(OccupancyStatuses);
};

/**
 * Retorna status que permitem reserva
 * @returns {Array} Lista de status que permitem reserva
 */
export const getAvailableForReservationStatuses = () => {
  return getAllStatuses().filter(status => status.allowsReservation);
};

/**
 * Cria status a partir de string
 * @param {string} statusStr - String do status
 * @returns {OccupancyStatus} Instância do status
 */
export const fromString = (statusStr) => {
  return new OccupancyStatus(statusStr);
};
