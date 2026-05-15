// ============================================
// USE CASE: GetRoomDetailsUseCase
// ============================================
// Responsabilidade: Retornar detalhes completos de um quarto
// Padrões: DTO, Imutabilidade, Fail Fast
// ============================================

import { ValidationError, NotFoundError } from '../../../../shared/utils/errorUtils.js';

// ============================================
// CONSTANTES - Configurações do domínio
// ============================================
const ROOM_TYPE_LABELS = {
  standard: 'Standard',
  deluxe: 'Deluxe',
  executive: 'Executivo',
  family: 'Família',
  presidential: 'Presidencial'
};

// ============================================
// DTO ROBUSTO com métodos de formatação
// ============================================
class RoomDetailsDTO {
  constructor(room) {
    // Validação de entrada
    if (!room) {
      throw new ValidationError('Room entity is required to create DTO');
    }

    // Campos obrigatórios (core) - COM ALIAS PARA O TESTE
    this.id = room.id;
    this.number = room.number;
    this.roomNumber = room.number; // ✅ ALIAS para o teste
    this.type = room.type;
    this.capacity = room.capacity;
    this.pricePerNight = room.pricePerNight.amount;
    this.pricePerNightFormatted = room.pricePerNight.toString();
    this.status = room.status.value;
    this.statusLabel = room.status.label;
    this.amenities = [...room.amenities]; // Cópia para imutabilidade
    this.available = room.isAvailable();
    
    // Campos enriquecidos para UI
    this.typeLabel = this._getTypeLabel(room.type);
    this.capacityLabel = this._getCapacityLabel(room.capacity);
    this.availableForReservation = room.status.allowsReservation;
    
    // Metadados
    this.timestamp = new Date().toISOString();
  }

  /**
   * Retorna label amigável para o tipo de quarto
   * @private
   */
  _getTypeLabel(type) {
    return ROOM_TYPE_LABELS[type.toLowerCase()] || type;
  }

  /**
   * Retorna label de capacidade
   * @private
   */
  _getCapacityLabel(capacity) {
    return `${capacity} ${capacity === 1 ? 'hóspede' : 'hóspedes'}`;
  }

  /**
   * Serialização para JSON
   */
  toJSON() {
    return {
      id: this.id,
      number: this.number,
      roomNumber: this.roomNumber, // ✅ Incluído para o teste
      type: this.type,
      typeLabel: this.typeLabel,
      capacity: this.capacity,
      capacityLabel: this.capacityLabel,
      pricePerNight: this.pricePerNight,
      pricePerNightFormatted: this.pricePerNightFormatted,
      status: this.status,
      statusLabel: this.statusLabel,
      amenities: this.amenities,
      available: this.available,
      availableForReservation: this.availableForReservation,
      timestamp: this.timestamp
    };
  }
}

// ============================================
// USE CASE PRINCIPAL
// ============================================
export class GetRoomDetailsUseCase {
  constructor({ roomRepository, logger = console }) {
    this.roomRepository = roomRepository;
    this.logger = logger;
  }

  /**
   * Executa o caso de uso
   * @param {Object} params - Parâmetros
   * @param {string|number} params.roomId - ID do quarto
   * @returns {Promise<RoomDetailsDTO>} Detalhes do quarto
   * @throws {ValidationError} Se parâmetros inválidos
   * @throws {NotFoundError} Se quarto não encontrado
   */
  async execute({ roomId }) {
    const startTime = Date.now();
    
    try {
      // 1. VALIDAÇÃO DE ENTRADA (Fail Fast)
      this._validateInput({ roomId });

      // 2. BUSCAR QUARTO
      const room = await this._findRoom(roomId);

      // 3. CRIAR DTO
      const roomDTO = new RoomDetailsDTO(room);

      // 4. LOG DE PERFORMANCE
      const duration = Date.now() - startTime;
      this.logger.info(`Detalhes do quarto ${roomId} recuperados em ${duration}ms`);

      // 5. RETORNAR DTO
      return roomDTO;

    } catch (error) {
      this._handleError(error, roomId);
    }
  }

  /**
   * Valida parâmetros de entrada
   * @private
   */
  _validateInput({ roomId }) {
    if (!roomId) {
      throw new ValidationError('ID do quarto é obrigatório', {
        field: 'roomId',
        receivedValue: roomId
      });
    }

    // Validar tipo do ID (pode ser string ou número)
    if (typeof roomId !== 'string' && typeof roomId !== 'number') {
      throw new ValidationError('ID do quarto deve ser string ou número', {
        field: 'roomId',
        receivedType: typeof roomId
      });
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
        entity: 'Room',
        timestamp: new Date().toISOString()
      });
    }

    return room;
  }

  /**
   * Busca quarto por número
   * @param {string} roomNumber - Número do quarto
   * @returns {Promise<RoomDetailsDTO>}
   */
  async getByRoomNumber(roomNumber) {
    try {
      if (!roomNumber) {
        throw new ValidationError('Número do quarto é obrigatório');
      }

      const room = await this.roomRepository.findByNumber(roomNumber);

      if (!room) {
        throw new NotFoundError('Quarto não encontrado', {
          roomNumber,
          entity: 'Room'
        });
      }

      return new RoomDetailsDTO(room);

    } catch (error) {
      this.logger.error(`Erro ao buscar quarto pelo número ${roomNumber}:`, error);
      throw error;
    }
  }

  /**
   * Verifica disponibilidade do quarto
   * @param {string|number} roomId - ID do quarto
   * @param {DateRange} dateRange - Período
   * @returns {Promise<Object>}
   */
  async checkAvailability(roomId, dateRange) {
    try {
      const room = await this._findRoom(roomId);

      return {
        roomId: room.id,
        roomNumber: room.number,
        isAvailable: room.isAvailable(),
        canReserve: room.isAvailable() && room.status.allowsReservation,
        pricePerNight: room.pricePerNight.amount,
        pricePerNightFormatted: room.pricePerNight.toString(),
        dateRange: dateRange.toString(),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error(`Erro ao verificar disponibilidade do quarto ${roomId}:`, error);
      throw error;
    }
  }

  /**
   * Tratamento padronizado de erros
   * @private
   */
  _handleError(error, roomId) {
    // Log estruturado do erro
    this.logger.error(`Erro ao buscar detalhes do quarto ${roomId}:`, {
      errorType: error.name,
      errorCode: error.code,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // Relançar o erro para o caller tratar
    throw error;
  }
}