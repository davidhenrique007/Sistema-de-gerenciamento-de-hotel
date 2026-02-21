/**
 * Utilitários de manipulação e formatação de datas
 * @module dateUtils
 */

import { ValidationError } from './errorUtils.js';

/**
 * Formatos de data suportados
 */
export const DateFormat = {
  DD_MM_YYYY: 'dd/MM/yyyy',
  YYYY_MM_DD: 'yyyy-MM-dd',
  MM_DD_YYYY: 'MM/dd/yyyy',
  DD_MM_YYYY_HH_MM: 'dd/MM/yyyy HH:mm',
  YYYY_MM_DD_HH_MM: 'yyyy-MM-dd HH:mm',
  HH_MM: 'HH:mm'
};

/**
 * Valida e converte entrada para objeto Date
 * @param {string|Date} date - Data a ser validada
 * @returns {Date} Objeto Date válido
 * @throws {ValidationError} Quando a data é inválida
 */
const parseDate = (date) => {
  if (date instanceof Date && !isNaN(date)) {
    return new Date(date);
  }

  if (typeof date === 'string') {
    const parsed = new Date(date);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }

  throw new ValidationError('Data inválida', {
    field: 'date',
    receivedValue: date
  });
};

/**
 * Formata data de acordo com o formato especificado
 * @param {Date|string} date - Data a ser formatada
 * @param {string} format - Formato desejado (use DateFormat)
 * @returns {string} Data formatada
 * @throws {ValidationError} Quando a data é inválida
 */
export const formatDate = (date, format = DateFormat.DD_MM_YYYY) => {
  try {
    const dateObj = parseDate(date);

    const pad = (num) => String(num).padStart(2, '0');

    const replacements = {
      'dd': pad(dateObj.getDate()),
      'MM': pad(dateObj.getMonth() + 1),
      'yyyy': dateObj.getFullYear(),
      'HH': pad(dateObj.getHours()),
      'mm': pad(dateObj.getMinutes()),
      'ss': pad(dateObj.getSeconds())
    };

    return format.replace(/dd|MM|yyyy|HH|mm|ss/g, (match) => replacements[match]);
  } catch (error) {
    throw new ValidationError('Erro ao formatar data', {
      format,
      originalError: error.message
    });
  }
};

/**
 * Calcula diferença em dias entre duas datas
 * @param {Date|string} startDate - Data inicial
 * @param {Date|string} endDate - Data final
 * @param {boolean} absolute - Retornar valor absoluto
 * @returns {number} Diferença em dias
 * @throws {ValidationError} Quando as datas são inválidas
 */
export const daysDifference = (startDate, endDate, absolute = true) => {
  try {
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    // Resetar horas para comparar apenas datas
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return absolute ? Math.abs(diffDays) : diffDays;
  } catch (error) {
    throw new ValidationError('Erro ao calcular diferença de dias', {
      startDate,
      endDate,
      originalError: error.message
    });
  }
};

/**
 * Adiciona dias a uma data
 * @param {Date|string} date - Data base
 * @param {number} days - Número de dias a adicionar
 * @returns {Date} Nova data
 * @throws {ValidationError} Quando a data é inválida
 */
export const addDays = (date, days) => {
  try {
    const dateObj = parseDate(date);
    const result = new Date(dateObj);
    result.setDate(result.getDate() + days);
    return result;
  } catch (error) {
    throw new ValidationError('Erro ao adicionar dias', {
      originalDate: date,
      daysToAdd: days,
      originalError: error.message
    });
  }
};

/**
 * Verifica se uma data está entre duas outras
 * @param {Date|string} date - Data a verificar
 * @param {Date|string} startDate - Data inicial
 * @param {Date|string} endDate - Data final
 * @param {boolean} inclusive - Incluir os extremos
 * @returns {boolean} true se está entre
 */
export const isDateBetween = (date, startDate, endDate, inclusive = true) => {
  try {
    const dateObj = parseDate(date);
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    if (inclusive) {
      return dateObj >= start && dateObj <= end;
    }
    return dateObj > start && dateObj < end;
  } catch {
    return false;
  }
};

/**
 * Retorna o primeiro dia do mês
 * @param {Date|string} date - Data base
 * @returns {Date} Primeiro dia do mês
 */
export const getFirstDayOfMonth = (date) => {
  const dateObj = parseDate(date);
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
};

/**
 * Retorna o último dia do mês
 * @param {Date|string} date - Data base
 * @returns {Date} Último dia do mês
 */
export const getLastDayOfMonth = (date) => {
  const dateObj = parseDate(date);
  return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
};

/**
 * Verifica se uma data é válida
 * @param {*} date - Valor a verificar
 * @returns {boolean} true se é uma data válida
 */
export const isValidDate = (date) => {
  if (date instanceof Date) {
    return !isNaN(date);
  }
  if (typeof date === 'string') {
    const parsed = new Date(date);
    return !isNaN(parsed);
  }
  return false;
};