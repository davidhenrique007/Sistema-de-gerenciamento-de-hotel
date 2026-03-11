// ============================================
// USE CASE: UpdateRoomOccupancyUseCase
// ============================================
// Responsabilidade: Gerenciar ocupação e liberação de quartos
// Padrões: Strategy, DTO, Fail Fast, Imutabilidade
// ============================================

import { AppError, ValidationError } from '../../../../shared/utils/errorUtils.js';

// ============================================
// CONSTANTES
// ============================================
export const OccupancyAction = {
  OCCUPY: 'occupy',
  RELEASE: 'release',
  MAINTENANCE: 'maintenance'
};

// ============================================
// DTO com método toJSON() - CORRIGIDO
// ============================================
class OccupancyResultDTO {
  constructor(room, action, success, message) {
    this.roomId = room.id;
    this.roomNumber = room.number;
    this.currentStatus = room.status.value;
    this.currentStatusLabel = room.status.label;
    this.action = action;
    this.success = success;
    this.timestamp = new Date().toISOString();
    this.message = message;
  }

  // ✅ MÉTODO toJSON() ADICIONADO - resolve o erro
  toJSON() {
    return {
      roomId: this.roomId,
      roomNumber: this.roomNumber,
      currentStatus: this.currentStatus,
      currentStatusLabel: this.currentStatusLabel,
      action: this.action,
      success: this.success,
      timestamp: this.timestamp,
      message: this.message
    };
  }
}

// ============================================
// USE CASE PRINCIPAL
// ============================================
export class UpdateRoomOccupancyUseCase {
  constructor({ roomRepository, logger = console }) {
    this.roomRepository = roomRepository;
    this.logger = logger;
  }

  async execute({ roomId, action, options = {} }) {
    try {
      // 1. VALIDAÇÕES INICIAIS (Fail Fast)
      this._validateParams({ roomId, action, options });

      // 2. BUSCAR QUARTO
      const room = await this._findRoom(roomId);

      // 3. EXECUTAR AÇÃO BASEADA NO TIPO (Strategy Pattern)
      const { updatedRoom, message } = await this._executeAction(room, action, options);

      // 4. PERSISTIR MUDANÇAS
      await this.roomRepository.update(updatedRoom);

      // 5. CRIAR E RETORNAR RESULTADO
      const result = new OccupancyResultDTO(updatedRoom, action, true, message);

      // 6. LOG ESTRUTURADO
      this.logger.info(`Room occupancy updated: ${room.number} - ${action}`, {
        result: result.toJSON()
      });

      return result;

    } catch (error) {
      this._handleError(error, roomId, action);
    }
  }

  /**
   * Valida parâmetros de entrada
   * @private
   */
  _validateParams({ roomId, action, options }) {
    const errors = [];

    if (!roomId) errors.push('ID do quarto é obrigatório');
    if (!action) errors.push('Ação é obrigatória');
    
    if (action === OccupancyAction.OCCUPY) {
      if (!options.guestsCount || options.guestsCount < 1) {
        errors.push('Número de hóspedes inválido');
      }
      if (!options.reservationId) {
        errors.push('ID da reserva é obrigatório');
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join('; '));
    }
  }

  /**
   * Busca quarto e valida existência
   * @private
   */
  async _findRoom(roomId) {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new AppError(`Quarto ${roomId} não encontrado`, 'ROOM_NOT_FOUND');
    }
    return room;
  }

  /**
   * Executa a ação específica (Strategy Pattern)
   * @private
   */
  async _executeAction(room, action, options) {
    switch (action) {
      case OccupancyAction.OCCUPY:
        return this._executeOccupy(room, options);
      case OccupancyAction.RELEASE:
        return this._executeRelease(room);
      case OccupancyAction.MAINTENANCE:
        return this._executeMaintenance(room);
      default:
        throw new AppError(`Ação inválida: ${action}`, 'INVALID_ACTION');
    }
  }

  /**
   * Executa ocupação de quarto
   * @private
   */
  async _executeOccupy(room, options) {
    // Verificar se já está ocupado
    if (room.isOccupied()) {
      throw new AppError(
        'Quarto já está ocupado', 
        'ROOM_ALREADY_OCCUPIED',
        { roomId: room.id, currentStatus: room.status.value }
      );
    }

    const updatedRoom = room.occupy(options.guestsCount, options.reservationId);
    const message = `Quarto ${room.number} ocupado com sucesso`;

    return { updatedRoom, message };
  }

  /**
   * Executa liberação de quarto
   * @private
   */
  async _executeRelease(room) {
    // Verificar se pode liberar
    if (!room.isOccupied() && !room.isReserved()) {
      throw new AppError(
        'Apenas quartos ocupados ou reservados podem ser liberados',
        'RELEASE_FAILED',
        { 
          roomId: room.id, 
          currentStatus: room.status.value,
          isOccupied: room.isOccupied(),
          isReserved: room.isReserved()
        }
      );
    }

    const updatedRoom = room.release();
    const message = `Quarto ${room.number} liberado com sucesso`;

    return { updatedRoom, message };
  }

  /**
   * Executa manutenção de quarto
   * @private
   */
  async _executeMaintenance(room) {
    const updatedRoom = room.setMaintenance();
    const message = `Quarto ${room.number} em manutenção`;
    return { updatedRoom, message };
  }

  /**
   * Tratamento padronizado de erros
   * @private
   */
  _handleError(error, roomId, action) {
    this.logger.error(`Erro ao atualizar ocupação do quarto ${roomId}:`, {
      error: error.message,
      code: error.code,
      action,
      stack: error.stack
    });
    throw error;
  }

  // ============================================
  // MÉTODOS DE CONVENIÊNCIA
  // ============================================

  async occupy(roomId, guestsCount, reservationId) {
    return this.execute({
      roomId,
      action: OccupancyAction.OCCUPY,
      options: { guestsCount, reservationId }
    });
  }

  async release(roomId) {
    return this.execute({
      roomId,
      action: OccupancyAction.RELEASE
    });
  }

  async setMaintenance(roomId, reason = 'Manutenção programada') {
    return this.execute({
      roomId,
      action: OccupancyAction.MAINTENANCE,
      options: { reason }
    });
  }

  async getCurrentStatus(roomId) {
    const room = await this.roomRepository.findById(roomId);
    return room ? room.status.value : null;
  }
}