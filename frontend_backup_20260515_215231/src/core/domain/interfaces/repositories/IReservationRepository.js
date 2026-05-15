// ============================================
// INTERFACE: IReservationRepository
// ============================================
// Responsabilidade: Definir contrato para persistência de reservas
// Padrões: Interface Segregation Principle (ISP), Dependency Inversion (DIP)
// ============================================

/**
 * @interface IReservationRepository
 * 
 * Contrato para operações de persistência de reservas.
 * Qualquer implementação concreta (localStorage, API, banco de dados)
 * deve respeitar esta interface.
 * 
 * Todas as operações devem lançar AppError em caso de falha.
 */
export class IReservationRepository {
  /**
   * Retorna todas as reservas
   * @param {Object} options - Opções de consulta
   * @param {number} options.limit - Limite de resultados
   * @param {number} options.offset - Deslocamento para paginação
   * @param {string} options.sortBy - Campo para ordenação
   * @param {string} options.sortOrder - Direção da ordenação ('asc' ou 'desc')
   * @returns {Promise<Array<Reservation>>} Lista de reservas
   */
  async findAll(options = {}) {
    throw new Error('Método findAll deve ser implementado');
  }

  /**
   * Busca uma reserva pelo ID
   * @param {string|number} id - ID da reserva
   * @returns {Promise<Reservation|null>} Reserva encontrada ou null
   */
  async findById(id) {
    throw new Error('Método findById deve ser implementado');
  }

  /**
   * Salva uma nova reserva
   * @param {Reservation} reservation - Reserva a ser salva
   * @returns {Promise<Reservation>} Reserva salva
   * @throws {ValidationError} Se a reserva for inválida
   * @throws {ConflictError} Se houver conflito de datas com reserva existente
   */
  async save(reservation) {
    throw new Error('Método save deve ser implementado');
  }

  /**
   * Atualiza uma reserva existente
   * @param {Reservation} reservation - Reserva com dados atualizados
   * @returns {Promise<Reservation>} Reserva atualizada
   * @throws {NotFoundError} Se a reserva não existir
   * @throws {ValidationError} Se a reserva for inválida
   * @throws {ConflictError} Se houver conflito de datas com reserva existente
   */
  async update(reservation) {
    throw new Error('Método update deve ser implementado');
  }

  /**
   * Remove uma reserva pelo ID
   * @param {string|number} id - ID da reserva
   * @returns {Promise<boolean>} true se removida com sucesso
   * @throws {NotFoundError} Se a reserva não existir
   * @throws {ValidationError} Se a reserva não puder ser removida (ex: já finalizada)
   */
  async delete(id) {
    throw new Error('Método delete deve ser implementado');
  }

  /**
   * Verifica se uma reserva existe
   * @param {string|number} id - ID da reserva
   * @returns {Promise<boolean>} true se existe
   */
  async exists(id) {
    throw new Error('Método exists deve ser implementado');
  }

  /**
   * Retorna reservas para um período específico
   * @param {DateRange} dateRange - Período a ser consultado
   * @param {Object} options - Opções adicionais
   * @param {boolean} options.includeCancelled - Incluir reservas canceladas
   * @returns {Promise<Array<Reservation>>} Reservas no período
   */
  async findByDateRange(dateRange, options = {}) {
    throw new Error('Método findByDateRange deve ser implementado');
  }

  /**
   * Retorna reservas por status
   * @param {string} status - Status da reserva (ReservationStatus)
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Array<Reservation>>} Reservas com o status especificado
   */
  async findByStatus(status, options = {}) {
    throw new Error('Método findByStatus deve ser implementado');
  }

  /**
   * Retorna reservas para um quarto específico
   * @param {string|number} roomId - ID do quarto
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Array<Reservation>>} Reservas do quarto
   */
  async findByRoomId(roomId, options = {}) {
    throw new Error('Método findByRoomId deve ser implementado');
  }

  /**
   * Retorna reservas para um hóspede específico
   * @param {string} guestEmail - Email do hóspede
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Array<Reservation>>} Reservas do hóspede
   */
  async findByGuestEmail(guestEmail, options = {}) {
    throw new Error('Método findByGuestEmail deve ser implementado');
  }

  /**
   * Retorna reservas ativas (confirmadas ou check-in realizado)
   * @returns {Promise<Array<Reservation>>} Reservas ativas
   */
  async findActive() {
    throw new Error('Método findActive deve ser implementado');
  }

  /**
   * Retorna reservas futuras (a partir de hoje)
   * @returns {Promise<Array<Reservation>>} Reservas futuras
   */
  async findUpcoming() {
    throw new Error('Método findUpcoming deve ser implementado');
  }

  /**
   * Verifica conflito de datas para um quarto
   * @param {string|number} roomId - ID do quarto
   * @param {DateRange} dateRange - Período a verificar
   * @param {string|number} excludeReservationId - ID da reserva a ignorar (para edição)
   * @returns {Promise<boolean>} true se há conflito
   */
  async hasConflict(roomId, dateRange, excludeReservationId = null) {
    throw new Error('Método hasConflict deve ser implementado');
  }

  /**
   * Retorna reservas conflitantes para um quarto
   * @param {string|number} roomId - ID do quarto
   * @param {DateRange} dateRange - Período a verificar
   * @param {string|number} excludeReservationId - ID da reserva a ignorar
   * @returns {Promise<Array<Reservation>>} Reservas conflitantes
   */
  async findConflicting(roomId, dateRange, excludeReservationId = null) {
    throw new Error('Método findConflicting deve ser implementado');
  }

  /**
   * Retorna estatísticas de reservas
   * @param {Object} period - Período para estatísticas
   * @param {Date} period.start - Data inicial
   * @param {Date} period.end - Data final
   * @returns {Promise<Object>} Estatísticas
   */
  async getStatistics(period = null) {
    throw new Error('Método getStatistics deve ser implementado');
  }

  /**
   * Cancela uma reserva
   * @param {string|number} id - ID da reserva
   * @returns {Promise<Reservation>} Reserva cancelada
   */
  async cancel(id) {
    throw new Error('Método cancel deve ser implementado');
  }

  /**
   * Confirma uma reserva
   * @param {string|number} id - ID da reserva
   * @returns {Promise<Reservation>} Reserva confirmada
   */
  async confirm(id) {
    throw new Error('Método confirm deve ser implementado');
  }

  /**
   * Realiza check-in de uma reserva
   * @param {string|number} id - ID da reserva
   * @returns {Promise<Reservation>} Reserva com check-in realizado
   */
  async checkIn(id) {
    throw new Error('Método checkIn deve ser implementado');
  }

  /**
   * Realiza check-out de uma reserva
   * @param {string|number} id - ID da reserva
   * @returns {Promise<Reservation>} Reserva com check-out realizado
   */
  async checkOut(id) {
    throw new Error('Método checkOut deve ser implementado');
  }

  /**
   * Retorna reservas entre duas datas
   * @param {Date} startDate - Data inicial
   * @param {Date} endDate - Data final
   * @returns {Promise<Array<Reservation>>} Reservas no intervalo
   */
  async findBetweenDates(startDate, endDate) {
    throw new Error('Método findBetweenDates deve ser implementado');
  }

  /**
   * Retorna reservas para uma data específica
   * @param {Date} date - Data a consultar
   * @returns {Promise<Array<Reservation>>} Reservas na data
   */
  async findByDate(date) {
    throw new Error('Método findByDate deve ser implementado');
  }

  /**
   * Retorna reservas por tipo de quarto
   * @param {string} roomType - Tipo do quarto
   * @returns {Promise<Array<Reservation>>} Reservas para o tipo de quarto
   */
  async findByRoomType(roomType) {
    throw new Error('Método findByRoomType deve ser implementado');
  }
}