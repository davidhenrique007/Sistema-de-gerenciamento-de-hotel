// ============================================
// INTERFACE: IRoomRepository
// ============================================
// Responsabilidade: Definir contrato para persistência de quartos
// Padrões: Interface Segregation Principle (ISP), Dependency Inversion (DIP)
// ============================================

/**
 * @interface IRoomRepository
 * 
 * Contrato para operações de persistência de quartos.
 * Qualquer implementação concreta (localStorage, API, banco de dados)
 * deve respeitar esta interface.
 */
export class IRoomRepository {
  /**
   * Retorna todos os quartos, opcionalmente filtrados
   * @param {Object} filters - Filtros a serem aplicados
   * @param {boolean} filters.onlyAvailable - Apenas quartos disponíveis
   * @param {string} filters.type - Filtrar por tipo de quarto
   * @param {number} filters.minCapacity - Capacidade mínima
   * @param {number} filters.maxPrice - Preço máximo por noite
   * @returns {Promise<Array<Room>>} Lista de quartos
   */
  async findAll(filters = {}) {
    throw new Error('Método findAll deve ser implementado');
  }

  /**
   * Busca um quarto pelo ID
   * @param {string|number} id - ID do quarto
   * @returns {Promise<Room|null>} Quarto encontrado ou null
   */
  async findById(id) {
    throw new Error('Método findById deve ser implementado');
  }

  /**
   * Busca um quarto pelo número
   * @param {string} number - Número do quarto
   * @returns {Promise<Room|null>} Quarto encontrado ou null
   */
  async findByNumber(number) {
    throw new Error('Método findByNumber deve ser implementado');
  }

  /**
   * Salva um novo quarto
   * @param {Room} room - Quarto a ser salvo
   * @returns {Promise<Room>} Quarto salvo
   */
  async save(room) {
    throw new Error('Método save deve ser implementado');
  }

  /**
   * Atualiza um quarto existente
   * @param {Room} room - Quarto com dados atualizados
   * @returns {Promise<Room>} Quarto atualizado
   */
  async update(room) {
    throw new Error('Método update deve ser implementado');
  }

  /**
   * Remove um quarto pelo ID
   * @param {string|number} id - ID do quarto
   * @returns {Promise<boolean>} true se removido com sucesso
   */
  async delete(id) {
    throw new Error('Método delete deve ser implementado');
  }

  /**
   * Verifica se um quarto existe
   * @param {string|number} id - ID do quarto
   * @returns {Promise<boolean>} true se existe
   */
  async exists(id) {
    throw new Error('Método exists deve ser implementado');
  }

  /**
   * Retorna quartos por tipo
   * @param {string} type - Tipo de quarto
   * @returns {Promise<Array<Room>>} Lista de quartos do tipo
   */
  async findByType(type) {
    throw new Error('Método findByType deve ser implementado');
  }

  /**
   * Retorna quartos com capacidade mínima
   * @param {number} capacity - Capacidade mínima
   * @returns {Promise<Array<Room>>} Lista de quartos
   */
  async findByMinCapacity(capacity) {
    throw new Error('Método findByMinCapacity deve ser implementado');
  }

  /**
   * Retorna quartos disponíveis
   * @returns {Promise<Array<Room>>} Lista de quartos disponíveis
   */
  async findAvailable() {
    throw new Error('Método findAvailable deve ser implementado');
  }

  /**
   * Retorna quartos ocupados
   * @returns {Promise<Array<Room>>} Lista de quartos ocupados
   */
  async findOccupied() {
    throw new Error('Método findOccupied deve ser implementado');
  }

  /**
   * Retorna quartos em manutenção
   * @returns {Promise<Array<Room>>} Lista de quartos em manutenção
   */
  async findUnderMaintenance() {
    throw new Error('Método findUnderMaintenance deve ser implementado');
  }

  /**
   * Atualiza o status de vários quartos
   * @param {Array<string|number>} roomIds - IDs dos quartos
   * @param {OccupancyStatus} status - Novo status
   * @returns {Promise<Array<Room>>} Quartos atualizados
   */
  async bulkUpdateStatus(roomIds, status) {
    throw new Error('Método bulkUpdateStatus deve ser implementado');
  }
}