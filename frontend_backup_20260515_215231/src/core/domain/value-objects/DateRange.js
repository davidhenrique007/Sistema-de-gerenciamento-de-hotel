// ============================================
// VALUE OBJECT: DateRange
// ============================================
// Representa um período de reserva com validações
// e operações específicas de intervalo de datas
// ============================================

// Importações de utilitários compartilhados
import { isValidDate, daysDifference, isDateBetween } from '../../../shared/utils/dateUtils.js';
import { ValidationError } from '../../../shared/utils/errorUtils.js';

// ============================================
// CLASSE PRINCIPAL
// ============================================

export class DateRange {
  /**
   * Cria uma nova instância de DateRange
   * @param {Date|string} checkIn - Data de check-in
   * @param {Date|string} checkOut - Data de check-out
   * @throws {ValidationError} Quando as datas são inválidas
   */
  constructor(checkIn, checkOut) {
    // Validar e converter datas
    const startDate = this._parseDate(checkIn, 'checkIn');
    const endDate = this._parseDate(checkOut, 'checkOut');

    // Validar se check-out é posterior a check-in
    this._validateDateOrder(startDate, endDate);

    // Propriedades imutáveis (congelar objeto)
    this._checkIn = startDate;
    this._checkOut = endDate;
    
    // Congelar a instância para garantir imutabilidade
    Object.freeze(this);
  }

  // ============================================
  // MÉTODOS PRIVADOS
  // ============================================

  /**
   * Valida e converte data para objeto Date
   * @private
   * @param {Date|string} date - Data a ser validada
   * @param {string} fieldName - Nome do campo para mensagem de erro
   * @returns {Date} Objeto Date válido
   * @throws {ValidationError} Quando a data é inválida
   */
  _parseDate(date, fieldName) {
    if (!date) {
      throw new ValidationError(`${fieldName} é obrigatório`, {
        field: fieldName,
        receivedValue: date
      });
    }

    if (!isValidDate(date)) {
      throw new ValidationError(`${fieldName} deve ser uma data válida`, {
        field: fieldName,
        receivedValue: date
      });
    }

    // Criar nova data e resetar horas para comparação precisa
    const parsedDate = new Date(date);
    parsedDate.setHours(0, 0, 0, 0);
    
    return parsedDate;
  }

  /**
   * Valida se check-out é posterior a check-in
   * @private
   * @param {Date} start - Data de check-in
   * @param {Date} end - Data de check-out
   * @throws {ValidationError} Quando check-out <= check-in
   */
  _validateDateOrder(start, end) {
    if (end <= start) {
      throw new ValidationError('Data de check-out deve ser posterior ao check-in', {
        checkIn: start.toISOString(),
        checkOut: end.toISOString()
      });
    }
  }

  // ============================================
  // GETTERS (ACESSO CONTROLADO)
  // ============================================

  /**
   * Retorna data de check-in (cópia para manter imutabilidade)
   * @returns {Date} Cópia da data de check-in
   */
  get checkIn() {
    return new Date(this._checkIn);
  }

  /**
   * Retorna data de check-out (cópia para manter imutabilidade)
   * @returns {Date} Cópia da data de check-out
   */
  get checkOut() {
    return new Date(this._checkOut);
  }

  // ============================================
  // MÉTODOS DE NEGÓCIO
  // ============================================

  /**
   * Calcula quantidade de noites da reserva
   * @returns {number} Número de noites
   */
  getNights() {
    return daysDifference(this._checkIn, this._checkOut, false);
  }

  /**
   * Verifica se uma data está dentro do período
   * @param {Date|string} date - Data a ser verificada
   * @param {boolean} inclusive - Incluir as datas extremas
   * @returns {boolean} true se a data está no período
   */
  contains(date, inclusive = true) {
    return isDateBetween(date, this._checkIn, this._checkOut, inclusive);
  }

  /**
   * Verifica se dois períodos se sobrepõem
   * @param {DateRange} other - Outro período
   * @returns {boolean} true se houver sobreposição
   */
  overlaps(other) {
    if (!(other instanceof DateRange)) {
      throw new ValidationError('Parâmetro deve ser uma instância de DateRange', {
        receivedType: typeof other
      });
    }

    // Dois períodos se sobrepõem se:
    // A.start <= B.end AND A.end >= B.start
    return this._checkIn <= other._checkOut && this._checkOut >= other._checkIn;
  }

  /**
   * Retorna a duração total em dias
   * @returns {number} Duração em dias
   */
  get duration() {
    return this.getNights();
  }

  /**
   * Verifica se o período é válido (mínimo 1 noite)
   * @returns {boolean} true se válido
   */
  isValid() {
    return this.getNights() >= 1;
  }

  /**
   * Verifica se o período é futuro (check-in > hoje)
   * @returns {boolean} true se futuro
   */
  isFuture() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this._checkIn > today;
  }

  /**
   * Verifica se o período é passado (check-out < hoje)
   * @returns {boolean} true se passado
   */
  isPast() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this._checkOut < today;
  }

  /**
   * Verifica se o período inclui a data atual
   * @returns {boolean} true se atual
   */
  isCurrent() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.contains(today);
  }

  // ============================================
  // MÉTODOS DE COMPARAÇÃO
  // ============================================

  /**
   * Compara com outro DateRange
   * @param {DateRange} other - Outro período
   * @returns {boolean} true se são iguais
   */
  equals(other) {
    if (!(other instanceof DateRange)) return false;
    
    return this._checkIn.getTime() === other._checkIn.getTime() &&
           this._checkOut.getTime() === other._checkOut.getTime();
  }

  // ============================================
  // MÉTODOS DE FORMATAÇÃO (Puros, sem UI)
  // ============================================

  /**
   * Retorna representação string do período
   * @returns {string} Período formatado (YYYY-MM-DD)
   */
  toString() {
    const checkInStr = this._checkIn.toISOString().split('T')[0];
    const checkOutStr = this._checkOut.toISOString().split('T')[0];
    return `${checkInStr} a ${checkOutStr}`;
  }

  /**
   * Retorna representação para logging
   * @returns {Object} Objeto com dados do período
   */
  toJSON() {
    return {
      checkIn: this._checkIn.toISOString(),
      checkOut: this._checkOut.toISOString(),
      nights: this.getNights()
    };
  }
}

// ============================================
// FUNÇÕES FACTORY (AUXILIARES)
// ============================================

/**
 * Cria um DateRange a partir de strings ISO
 * @param {string} checkInStr - Data check-in (YYYY-MM-DD)
 * @param {string} checkOutStr - Data check-out (YYYY-MM-DD)
 * @returns {DateRange} Novo DateRange
 */
export const createDateRange = (checkInStr, checkOutStr) => {
  return new DateRange(new Date(checkInStr), new Date(checkOutStr));
};

/**
 * Cria um DateRange para um número de noites a partir de hoje
 * @param {number} nights - Número de noites
 * @returns {DateRange} Novo DateRange
 */
export const createDateRangeFromToday = (nights) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkOut = new Date(today);
  checkOut.setDate(checkOut.getDate() + nights);
  
  return new DateRange(today, checkOut);
};
