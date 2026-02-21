// ============================================
// USE CASE: ListAvailableRoomsUseCase
// ============================================
// Responsabilidade: Listar quartos disponíveis
// com aplicação de filtros de negócio
// ============================================

// ============================================
// IMPORTAÇÕES
// ============================================
import { OccupancyStatuses } from '../../../domain/value-objects/OccupancyStatus.js';
import { ValidationError } from '../../../../shared/utils/errorUtils.js';
import { Money } from '../../../domain/value-objects/Money.js';

// ============================================
// DTO - DATA TRANSFER OBJECT
// ============================================

/**
 * DTO para retornar dados do quarto para a UI
 * Dados limpos e prontos para consumo
 */
class RoomListItemDTO {
  constructor(room) {
    this.id = room.id;
    this.number = room.number;
    this.type = room.type;
    this.capacity = room.capacity;
    this.pricePerNight = room.pricePerNight.amount;
    this.pricePerNightFormatted = room.pricePerNight.toString();
    this.status = room.status.value;
    this.statusLabel = room.status.label;
    this.mainImage = `/assets/images/rooms/${room.type}/main.jpg`;
    this.amenities = room.amenities.slice(0, 3); // Apenas os principais para listagem
    this.available = room.isAvailable();
  }

  toJSON() {
    return {
      id: this.id,
      number: this.number,
      type: this.type,
      capacity: this.capacity,
      pricePerNight: this.pricePerNight,
      pricePerNightFormatted: this.pricePerNightFormatted,
      status: this.status,
      statusLabel: this.statusLabel,
      mainImage: this.mainImage,
      amenities: this.amenities,
      available: this.available
    };
  }
}

// ============================================
// FILTROS DE BUSCA
// ============================================

/**
 * Filtros para busca de quartos disponíveis
 */
export class RoomFilters {
  constructor({
    minPrice = null,
    maxPrice = null,
    capacity = null,
    type = null,
    amenities = [],
    checkIn = null,
    checkOut = null,
    guestsCount = null
  } = {}) {
    this.minPrice = minPrice;
    this.maxPrice = maxPrice;
    this.capacity = capacity;
    this.type = type;
    this.amenities = amenities;
    this.checkIn = checkIn;
    this.checkOut = checkOut;
    this.guestsCount = guestsCount;

    // Validar filtros
    this._validate();
  }

  /**
   * Valida os filtros recebidos
   * @private
   */
  _validate() {
    // Validar preços
    if (this.minPrice !== null && (typeof this.minPrice !== 'number' || this.minPrice < 0)) {
      throw new ValidationError('Preço mínimo deve ser um número não negativo', {
        field: 'minPrice',
        receivedValue: this.minPrice
      });
    }

    if (this.maxPrice !== null && (typeof this.maxPrice !== 'number' || this.maxPrice < 0)) {
      throw new ValidationError('Preço máximo deve ser um número não negativo', {
        field: 'maxPrice',
        receivedValue: this.maxPrice
      });
    }

    if (this.minPrice !== null && this.maxPrice !== null && this.minPrice > this.maxPrice) {
      throw new ValidationError('Preço mínimo não pode ser maior que o preço máximo', {
        minPrice: this.minPrice,
        maxPrice: this.maxPrice
      });
    }

    // Validar capacidade
    if (this.capacity !== null && (typeof this.capacity !== 'number' || this.capacity < 1)) {
      throw new ValidationError('Capacidade deve ser um número maior que zero', {
        field: 'capacity',
        receivedValue: this.capacity
      });
    }

    // Validar tipo
    const validTypes = ['standard', 'deluxe', 'executive', 'family', 'presidential'];
    if (this.type !== null && !validTypes.includes(this.type.toLowerCase())) {
      throw new ValidationError('Tipo de quarto inválido', {
        field: 'type',
        receivedValue: this.type,
        validTypes
      });
    }

    // Validar amenities
    if (!Array.isArray(this.amenities)) {
      throw new ValidationError('Amenities deve ser um array', {
        field: 'amenities',
        receivedType: typeof this.amenities
      });
    }

    // Validar número de hóspedes
    if (this.guestsCount !== null && (typeof this.guestsCount !== 'number' || this.guestsCount < 1)) {
      throw new ValidationError('Número de hóspedes deve ser maior que zero', {
        field: 'guestsCount',
        receivedValue: this.guestsCount
      });
    }
  }

  /**
   * Verifica se um quarto atende aos filtros de preço
   * @param {Room} room - Quarto a ser verificado
   * @returns {boolean} true se atende
   */
  matchesPrice(room) {
    const price = room.pricePerNight.amount;

    if (this.minPrice !== null && price < this.minPrice) {
      return false;
    }

    if (this.maxPrice !== null && price > this.maxPrice) {
      return false;
    }

    return true;
  }

  /**
   * Verifica se um quarto atende aos filtros de capacidade
   * @param {Room} room - Quarto a ser verificado
   * @returns {boolean} true se atende
   */
  matchesCapacity(room) {
    if (this.capacity === null) {
      return true;
    }

    return room.capacity >= this.capacity;
  }

  /**
   * Verifica se um quarto atende aos filtros de tipo
   * @param {Room} room - Quarto a ser verificado
   * @returns {boolean} true se atende
   */
  matchesType(room) {
    if (this.type === null) {
      return true;
    }

    return room.type.toLowerCase() === this.type.toLowerCase();
  }

  /**
   * Verifica se um quarto atende aos filtros de amenities
   * @param {Room} room - Quarto a ser verificado
   * @returns {boolean} true se atende
   */
  matchesAmenities(room) {
    if (this.amenities.length === 0) {
      return true;
    }

    // Verifica se o quarto possui todas as amenities solicitadas
    return this.amenities.every(amenity => 
      room.amenities.some(roomAmenity => 
        roomAmenity.toLowerCase().includes(amenity.toLowerCase())
      )
    );
  }

  /**
   * Verifica se um quarto atende aos filtros de capacidade por hóspedes
   * @param {Room} room - Quarto a ser verificado
   * @returns {boolean} true se atende
   */
  matchesGuestsCount(room) {
    if (this.guestsCount === null) {
      return true;
    }

    return room.canAccommodate(this.guestsCount);
  }
}

// ============================================
// USE CASE PRINCIPAL
// ============================================

export class ListAvailableRoomsUseCase {
  /**
   * @param {Object} dependencies - Dependências injetadas
   * @param {RoomRepository} dependencies.roomRepository - Repositório de quartos
   */
  constructor({ roomRepository }) {
    this.roomRepository = roomRepository;
  }

  /**
   * Executa o caso de uso
   * @param {Object} params - Parâmetros de execução
   * @param {Object} params.filters - Filtros a serem aplicados
   * @returns {Promise<Array<RoomListItemDTO>>} Lista de quartos disponíveis
   */
  async execute({ filters = {} } = {}) {
    try {
      // 1. Validar e preparar filtros
      const roomFilters = new RoomFilters(filters);

      // 2. Buscar todos os quartos do repositório
      const allRooms = await this.roomRepository.findAll();

      // 3. Filtrar quartos disponíveis
      let availableRooms = allRooms.filter(room => room.isAvailable());

      // 4. Aplicar filtros adicionais
      availableRooms = this._applyFilters(availableRooms, roomFilters);

      // 5. Ordenar resultados (por preço, padrão)
      availableRooms = this._sortRooms(availableRooms, filters.sortBy);

      // 6. Converter para DTO
      const roomDTOs = availableRooms.map(room => new RoomListItemDTO(room));

      return roomDTOs;
    } catch (error) {
      // Log do erro (seria feito pelo logger)
      console.error('Erro ao listar quartos disponíveis:', error);
      
      // Relançar erro padronizado
      throw error;
    }
  }

  /**
   * Aplica filtros aos quartos
   * @private
   * @param {Array<Room>} rooms - Quartos a serem filtrados
   * @param {RoomFilters} filters - Filtros a aplicar
   * @returns {Array<Room>} Quartos filtrados
   */
  _applyFilters(rooms, filters) {
    return rooms.filter(room => {
      // Aplicar cada filtro sequencialmente
      return (
        filters.matchesPrice(room) &&
        filters.matchesCapacity(room) &&
        filters.matchesType(room) &&
        filters.matchesAmenities(room) &&
        filters.matchesGuestsCount(room)
      );
    });
  }

  /**
   * Ordena os quartos conforme critério
   * @private
   * @param {Array<Room>} rooms - Quartos a ordenar
   * @param {string} sortBy - Critério de ordenação
   * @returns {Array<Room>} Quartos ordenados
   */
  _sortRooms(rooms, sortBy = 'price_asc') {
    const sorted = [...rooms];

    switch (sortBy) {
      case 'price_asc':
        return sorted.sort((a, b) => a.pricePerNight.amount - b.pricePerNight.amount);
      
      case 'price_desc':
        return sorted.sort((a, b) => b.pricePerNight.amount - a.pricePerNight.amount);
      
      case 'capacity_asc':
        return sorted.sort((a, b) => a.capacity - b.capacity);
      
      case 'capacity_desc':
        return sorted.sort((a, b) => b.capacity - a.capacity);
      
      default:
        return sorted;
    }
  }

  /**
   * Versão simplificada para obter apenas quartos disponíveis sem filtros
   * @returns {Promise<Array<RoomListItemDTO>>} Lista de quartos disponíveis
   */
  async getAvailableRooms() {
    return this.execute();
  }

  /**
   * Versão para buscar quartos por capacidade mínima
   * @param {number} guests - Número de hóspedes
   * @returns {Promise<Array<RoomListItemDTO>>} Quartos que comportam os hóspedes
   */
  async getRoomsByGuests(guests) {
    return this.execute({
      filters: {
        guestsCount: guests
      }
    });
  }
}