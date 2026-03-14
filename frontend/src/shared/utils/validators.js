/**
 * Utilitários de validação de dados
 * @module validators
 */

import { sanitizeEmail, sanitizePhone } from './sanitizer.js';

/**
 * Classe de erro personalizada para validações
 */
class ValidationError extends Error {
  constructor(message, code = 'VALIDATION_ERROR', context = {}) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Valida um email
 * @param {string} email - Email a ser validado
 * @param {Object} options - Opções de validação
 * @param {boolean} options.required - Se o campo é obrigatório (default: true)
 * @param {boolean} options.sanitize - Se deve sanitizar antes de validar (default: true)
 * @returns {boolean} true se válido
 * @throws {ValidationError} Quando o email é inválido
 */
export const validateEmail = (email, options = {}) => {
  const { required = true, sanitize = true } = options;

  // Validação de campo obrigatório
  if (required && (email === null || email === undefined || email === '')) {
    throw new ValidationError('Email é obrigatório', 'REQUIRED_FIELD', { field: 'email' });
  }

  // Se não for obrigatório e estiver vazio, considerar válido
  if (!required && (!email || email === '')) {
    return true;
  }

  // Sanitizar se necessário
  const emailToValidate = sanitize ? sanitizeEmail(email) : email;

  // Regex para validação de email
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(emailToValidate)) {
    throw new ValidationError('Email inválido', 'INVALID_EMAIL', {
      providedEmail: email,
      sanitizedEmail: emailToValidate
    });
  }

  return true;
};

/**
 * Valida um número de telefone (formato Moçambicano)
 * @param {string} phone - Telefone a ser validado
 * @param {Object} options - Opções de validação
 * @param {boolean} options.required - Se o campo é obrigatório (default: true)
 * @param {boolean} options.sanitize - Se deve sanitizar antes de validar (default: true)
 * @returns {boolean} true se válido
 * @throws {ValidationError} Quando o telefone é inválido
 */
export const validatePhone = (phone, options = {}) => {
  const { required = true, sanitize = true } = options;

  // Validação de campo obrigatório
  if (required && (phone === null || phone === undefined || phone === '')) {
    throw new ValidationError('Telefone é obrigatório', 'REQUIRED_FIELD', { field: 'phone' });
  }

  // Se não for obrigatório e estiver vazio, considerar válido
  if (!required && (!phone || phone === '')) {
    return true;
  }

  // Sanitizar se necessário (remover caracteres não numéricos)
  const phoneToValidate = sanitize ? phone.replace(/\D/g, '') : phone;

  // VALIDAÇÃO PARA MOÇAMBIQUE 🇲🇿
  // Formato nacional: 9 dígitos, começando com 8 (84, 85, 86, 87)
  const mzRegex = /^[8][4-7][0-9]{7}$/;

  // Formato internacional: 12 dígitos começando com 258
  const mzInternationalRegex = /^258[8][4-7][0-9]{7}$/;

  if (!mzRegex.test(phoneToValidate) && !mzInternationalRegex.test(phoneToValidate)) {
    throw new ValidationError('Telefone inválido (use formato: 84 123 4567)', 'INVALID_PHONE', {
      providedPhone: phone,
      sanitizedPhone: phoneToValidate,
      expectedFormat: 'Moçambicano (9 dígitos)'
    });
  }

  return true;
};

/**
 * Valida campo obrigatório
 * @param {*} value - Valor a ser validado
 * @param {string} fieldName - Nome do campo (para mensagem de erro)
 * @returns {boolean} true se válido
 * @throws {ValidationError} Quando o campo é obrigatório e está vazio
 */
export const validateRequired = (value, fieldName) => {
  if (value === null || value === undefined || value === '') {
    throw new ValidationError(
      `${fieldName || 'Campo'} é obrigatório`,
      'REQUIRED_FIELD',
      { field: fieldName }
    );
  }

  if (typeof value === 'string' && value.trim() === '') {
    throw new ValidationError(
      `${fieldName || 'Campo'} não pode estar vazio`,
      'REQUIRED_FIELD',
      { field: fieldName }
    );
  }

  if (Array.isArray(value) && value.length === 0) {
    throw new ValidationError(
      `${fieldName || 'Campo'} deve conter pelo menos um item`,
      'REQUIRED_FIELD',
      { field: fieldName }
    );
  }

  return true;
};

/**
 * Valida tamanho mínimo de string
 * @param {string} value - String a ser validada
 * @param {number} minLength - Tamanho mínimo
 * @param {string} fieldName - Nome do campo
 * @returns {boolean} true se válido
 * @throws {ValidationError} Quando a string é menor que o mínimo
 */
export const validateMinLength = (value, minLength, fieldName) => {
  if (typeof value !== 'string') {
    throw new ValidationError(
      `${fieldName || 'Campo'} deve ser uma string`,
      'INVALID_TYPE',
      { field: fieldName, expectedType: 'string', receivedType: typeof value }
    );
  }

  if (value.length < minLength) {
    throw new ValidationError(
      `${fieldName || 'Campo'} deve ter no mínimo ${minLength} caracteres`,
      'MIN_LENGTH',
      { field: fieldName, minLength, currentLength: value.length }
    );
  }

  return true;
};

/**
 * Valida tamanho máximo de string
 * @param {string} value - String a ser validada
 * @param {number} maxLength - Tamanho máximo
 * @param {string} fieldName - Nome do campo
 * @returns {boolean} true se válido
 * @throws {ValidationError} Quando a string é maior que o máximo
 */
export const validateMaxLength = (value, maxLength, fieldName) => {
  if (typeof value !== 'string') {
    throw new ValidationError(
      `${fieldName || 'Campo'} deve ser uma string`,
      'INVALID_TYPE',
      { field: fieldName, expectedType: 'string', receivedType: typeof value }
    );
  }

  if (value.length > maxLength) {
    throw new ValidationError(
      `${fieldName || 'Campo'} deve ter no máximo ${maxLength} caracteres`,
      'MAX_LENGTH',
      { field: fieldName, maxLength, currentLength: value.length }
    );
  }

  return true;
};

/**
 * Valida intervalo de números
 * @param {number} value - Número a ser validado
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @param {string} fieldName - Nome do campo
 * @returns {boolean} true se válido
 * @throws {ValidationError} Quando o número está fora do intervalo
 */
export const validateRange = (value, min, max, fieldName) => {
  if (typeof value !== 'number') {
    throw new ValidationError(
      `${fieldName || 'Campo'} deve ser um número`,
      'INVALID_TYPE',
      { field: fieldName, expectedType: 'number', receivedType: typeof value }
    );
  }

  if (value < min || value > max) {
    throw new ValidationError(
      `${fieldName || 'Campo'} deve estar entre ${min} e ${max}`,
      'OUT_OF_RANGE',
      { field: fieldName, min, max, currentValue: value }
    );
  }

  return true;
};

/**
 * Valida se é uma data válida
 * @param {string|Date} date - Data a ser validada
 * @param {Object} options - Opções de validação
 * @param {Date} options.minDate - Data mínima
 * @param {Date} options.maxDate - Data máxima
 * @returns {boolean} true se válida
 * @throws {ValidationError} Quando a data é inválida
 */
export const validateDate = (date, options = {}) => {
  const { minDate, maxDate } = options;

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    throw new ValidationError('Data inválida', 'INVALID_DATE', { providedDate: date });
  }

  if (minDate && dateObj < minDate) {
    throw new ValidationError(
      `Data deve ser posterior a ${minDate.toLocaleDateString()}`,
      'DATE_TOO_EARLY',
      { providedDate: date, minDate }
    );
  }

  if (maxDate && dateObj > maxDate) {
    throw new ValidationError(
      `Data deve ser anterior a ${maxDate.toLocaleDateString()}`,
      'DATE_TOO_LATE',
      { providedDate: date, maxDate }
    );
  }

  return true;
};