// ============================================
// VALUE OBJECT: Money
// ============================================
// Representa valor monetário com precisão segura
// Evita problemas de floating point usando centavos
// ============================================

// Importações de utilitários
import { ValidationError } from '../../../shared/utils/errorUtils.js';

// ============================================
// CONSTANTES
// ============================================

const DEFAULT_CURRENCY = 'BRL';
const SUPPORTED_CURRENCIES = ['BRL', 'USD', 'EUR'];

// ============================================
// CLASSE PRINCIPAL
// ============================================

export class Money {
  /**
   * Cria uma nova instância de Money
   * @param {number} amount - Valor em reais (ex: 150.50)
   * @param {string} currency - Código da moeda (BRL, USD, EUR)
   * @throws {ValidationError} Quando o valor ou moeda são inválidos
   */
  constructor(amount, currency = DEFAULT_CURRENCY) {
    // Validar entrada
    this._validateAmount(amount);
    this._validateCurrency(currency);

    // Armazenar em centavos para precisão (inteiro)
    this._cents = Math.round(amount * 100);
    this._currency = currency;

    // Congelar a instância para garantir imutabilidade
    Object.freeze(this);
  }

  // ============================================
  // MÉTODOS PRIVADOS DE VALIDAÇÃO
  // ============================================

  /**
   * Valida o valor monetário
   * @private
   * @param {number} amount - Valor a ser validado
   * @throws {ValidationError} Quando o valor é inválido
   */
  _validateAmount(amount) {
    if (amount === null || amount === undefined) {
      throw new ValidationError('Valor monetário é obrigatório', {
        field: 'amount'
      });
    }

    if (typeof amount !== 'number') {
      throw new ValidationError('Valor monetário deve ser um número', {
        field: 'amount',
        receivedType: typeof amount
      });
    }

    if (isNaN(amount) || !isFinite(amount)) {
      throw new ValidationError('Valor monetário inválido', {
        field: 'amount',
        value: amount
      });
    }

    if (amount < 0) {
      throw new ValidationError('Valor monetário não pode ser negativo', {
        field: 'amount',
        value: amount
      });
    }
  }

  /**
   * Valida a moeda
   * @private
   * @param {string} currency - Código da moeda
   * @throws {ValidationError} Quando a moeda é inválida
   */
  _validateCurrency(currency) {
    if (!currency) {
      throw new ValidationError('Moeda é obrigatória', {
        field: 'currency'
      });
    }

    if (!SUPPORTED_CURRENCIES.includes(currency)) {
      throw new ValidationError(`Moeda não suportada: ${currency}`, {
        field: 'currency',
        supportedCurrencies: SUPPORTED_CURRENCIES
      });
    }
  }

  // ============================================
  // GETTERS
  // ============================================

  /**
   * Retorna o valor em reais (como número)
   * @returns {number} Valor em reais
   */
  get amount() {
    return this._cents / 100;
  }

  /**
   * Retorna o valor em centavos (inteiro)
   * @returns {number} Valor em centavos
   */
  get cents() {
    return this._cents;
  }

  /**
   * Retorna a moeda
   * @returns {string} Código da moeda
   */
  get currency() {
    return this._currency;
  }

  // ============================================
  // OPERAÇÕES MATEMÁTICAS (RETORNAM NOVO MONEY)
  // ============================================

  /**
   * Soma dois valores monetários
   * @param {Money} other - Outro valor monetário
   * @returns {Money} Novo Money com a soma
   * @throws {ValidationError} Quando as moedas são diferentes
   */
  add(other) {
    this._validateMoneyOperation(other, 'soma');

    if (this._currency !== other._currency) {
      throw new ValidationError('Não é possível somar moedas diferentes', {
        currentCurrency: this._currency,
        otherCurrency: other._currency
      });
    }

    const newCents = this._cents + other._cents;
    return new Money(newCents / 100, this._currency);
  }

  /**
   * Subtrai dois valores monetários
   * @param {Money} other - Outro valor monetário
   * @returns {Money} Novo Money com a subtração
   * @throws {ValidationError} Quando as moedas são diferentes ou resultado negativo
   */
  subtract(other) {
    this._validateMoneyOperation(other, 'subtração');

    if (this._currency !== other._currency) {
      throw new ValidationError('Não é possível subtrair moedas diferentes', {
        currentCurrency: this._currency,
        otherCurrency: other._currency
      });
    }

    const newCents = this._cents - other._cents;
    
    if (newCents < 0) {
      throw new ValidationError('Resultado da subtração não pode ser negativo', {
        originalAmount: this.amount,
        subtractAmount: other.amount
      });
    }

    return new Money(newCents / 100, this._currency);
  }

  /**
   * Multiplica o valor por um número
   * @param {number} multiplier - Multiplicador
   * @returns {Money} Novo Money com a multiplicação
   * @throws {ValidationError} Quando o multiplicador é inválido
   */
  multiply(multiplier) {
    if (typeof multiplier !== 'number' || isNaN(multiplier) || multiplier < 0) {
      throw new ValidationError('Multiplicador deve ser um número positivo', {
        receivedValue: multiplier
      });
    }

    const newCents = Math.round(this._cents * multiplier);
    return new Money(newCents / 100, this._currency);
  }

  /**
   * Divide o valor por um número
   * @param {number} divisor - Divisor
   * @returns {Money} Novo Money com a divisão
   * @throws {ValidationError} Quando o divisor é inválido
   */
  divide(divisor) {
    if (typeof divisor !== 'number' || isNaN(divisor) || divisor <= 0) {
      throw new ValidationError('Divisor deve ser um número positivo maior que zero', {
        receivedValue: divisor
      });
    }

    const newCents = Math.round(this._cents / divisor);
    return new Money(newCents / 100, this._currency);
  }

  /**
   * Aplica uma porcentagem ao valor
   * @param {number} percentage - Porcentagem (ex: 10 para 10%)
   * @returns {Money} Novo Money com a porcentagem aplicada
   */
  percentage(percentage) {
    return this.multiply(percentage / 100);
  }

  // ============================================
  // MÉTODOS DE VALIDAÇÃO DE OPERAÇÕES
  // ============================================

  /**
   * Valida se o objeto é uma instância válida de Money
   * @private
   * @param {*} other - Objeto a ser validado
   * @param {string} operation - Nome da operação
   * @throws {ValidationError} Quando o objeto é inválido
   */
  _validateMoneyOperation(other, operation) {
    if (!(other instanceof Money)) {
      throw new ValidationError(`Operação de ${operation} requer instância de Money`, {
        receivedType: typeof other
      });
    }
  }

  // ============================================
  // MÉTODOS DE COMPARAÇÃO
  // ============================================

  /**
   * Compara com outro Money
   * @param {Money} other - Outro valor monetário
   * @returns {boolean} true se são iguais
   */
  equals(other) {
    if (!(other instanceof Money)) return false;
    
    return this._cents === other._cents && this._currency === other._currency;
  }

  /**
   * Verifica se é maior que outro
   * @param {Money} other - Outro valor monetário
   * @returns {boolean} true se maior
   */
  greaterThan(other) {
    this._validateMoneyOperation(other, 'comparação');
    return this._cents > other._cents;
  }

  /**
   * Verifica se é menor que outro
   * @param {Money} other - Outro valor monetário
   * @returns {boolean} true se menor
   */
  lessThan(other) {
    this._validateMoneyOperation(other, 'comparação');
    return this._cents < other._cents;
  }

  // ============================================
  // MÉTODOS DE FORMATAÇÃO (PUROS, SEM UI)
  // ============================================

  /**
   * Retorna representação string simples
   * @returns {string} Valor formatado simples
   */
  toString() {
    const value = (this._cents / 100).toFixed(2);
    return `${value} ${this._currency}`;
  }

  /**
   * Retorna representação para logging
   * @returns {Object} Objeto com dados do valor
   */
  toJSON() {
    return {
      amount: this.amount,
      cents: this._cents,
      currency: this._currency
    };
  }

  /**
   * Retorna o valor formatado (sem símbolo monetário)
   * @returns {string} Valor com duas casas decimais
   */
  toFormattedString() {
    return (this._cents / 100).toFixed(2);
  }
}

// ============================================
// FUNÇÕES FACTORY (AUXILIARES)
// ============================================

/**
 * Cria um valor monetário zero
 * @param {string} currency - Moeda
 * @returns {Money} Valor zero
 */
export const zeroMoney = (currency = DEFAULT_CURRENCY) => {
  return new Money(0, currency);
};

/**
 * Cria um valor monetário a partir de centavos
 * @param {number} cents - Valor em centavos
 * @param {string} currency - Moeda
 * @returns {Money} Novo Money
 */
export const moneyFromCents = (cents, currency = DEFAULT_CURRENCY) => {
  return new Money(cents / 100, currency);
};

/**
 * Soma um array de valores monetários
 * @param {Money[]} amounts - Array de valores
 * @returns {Money} Valor total
 * @throws {ValidationError} Quando as moedas são diferentes
 */
export const sumMoney = (amounts) => {
  if (!Array.isArray(amounts) || amounts.length === 0) {
    return zeroMoney();
  }

  const firstCurrency = amounts[0].currency;
  let totalCents = 0;

  for (const amount of amounts) {
    if (amount.currency !== firstCurrency) {
      throw new ValidationError('Todos os valores devem ter a mesma moeda para soma', {
        firstCurrency,
        conflictingCurrency: amount.currency
      });
    }
    totalCents += amount.cents;
  }

  return moneyFromCents(totalCents, firstCurrency);
};
