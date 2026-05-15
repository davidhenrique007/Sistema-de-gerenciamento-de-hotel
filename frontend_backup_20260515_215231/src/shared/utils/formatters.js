/**
 * Utilitários de formatação de dados numéricos e monetários
 * @module formatters
 */

import { ValidationError } from './errorUtils.js';

/**
 * Formata valor monetário com suporte a internacionalização
 * @param {number} value - Valor a ser formatado
 * @param {Object} options - Opções de formatação
 * @param {string} options.locale - Localidade (ex: 'pt-BR', 'en-US')
 * @param {string} options.currency - Código da moeda (ex: 'BRL', 'USD')
 * @param {boolean} options.autoSign - Adicionar sinal automaticamente
 * @returns {string} Valor formatado
 * @throws {ValidationError} Quando o valor é inválido
 */
export const formatCurrency = (value, options = {}) => {
  const {
    locale = 'pt-BR',
    currency = 'BRL',
    autoSign = false
  } = options;

  // Validação
  if (value === null || value === undefined) {
    throw new ValidationError('Valor não pode ser null ou undefined', {
      field: 'currency'
    });
  }

  if (typeof value !== 'number') {
    throw new ValidationError('Valor deve ser um número', {
      field: 'currency',
      receivedType: typeof value
    });
  }

  // Configuração do Intl
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  let formattedValue = formatter.format(value);

  // Adicionar sinal se solicitado
  if (autoSign && value > 0) {
    formattedValue = `+${formattedValue}`;
  } else if (autoSign && value < 0) {
    formattedValue = `-${formattedValue}`;
  }

  return formattedValue;
};

/**
 * Formata número com suporte a diferentes locais
 * @param {number} value - Valor a ser formatado
 * @param {Object} options - Opções de formatação
 * @param {string} options.locale - Localidade (ex: 'pt-BR', 'en-US')
 * @param {number} options.minimumFractionDigits - Mínimo de casas decimais
 * @param {number} options.maximumFractionDigits - Máximo de casas decimais
 * @param {boolean} options.useGrouping - Usar separador de milhares
 * @returns {string} Número formatado
 * @throws {ValidationError} Quando o valor é inválido
 */
export const formatNumber = (value, options = {}) => {
  const {
    locale = 'pt-BR',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    useGrouping = true
  } = options;

  // Validação
  if (value === null || value === undefined) {
    throw new ValidationError('Valor não pode ser null ou undefined', {
      field: 'number'
    });
  }

  if (typeof value !== 'number') {
    throw new ValidationError('Valor deve ser um número', {
      field: 'number',
      receivedType: typeof value
    });
  }

  // Configuração do Intl
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping
  });

  return formatter.format(value);
};

/**
 * Formata porcentagem
 * @param {number} value - Valor a ser formatado (ex: 0.15 para 15%)
 * @param {Object} options - Opções de formatação
 * @param {string} options.locale - Localidade
 * @param {number} options.minimumFractionDigits - Mínimo de casas decimais
 * @param {number} options.maximumFractionDigits - Máximo de casas decimais
 * @returns {string} Porcentagem formatada
 * @throws {ValidationError} Quando o valor é inválido
 */
export const formatPercentage = (value, options = {}) => {
  const {
    locale = 'pt-BR',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2
  } = options;

  // Validação
  if (value === null || value === undefined) {
    throw new ValidationError('Valor não pode ser null ou undefined', {
      field: 'percentage'
    });
  }

  if (typeof value !== 'number') {
    throw new ValidationError('Valor deve ser um número', {
      field: 'percentage',
      receivedType: typeof value
    });
  }

  // Configuração do Intl
  const formatter = new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits
  });

  return formatter.format(value);
};

/**
 * Formata número de telefone
 * @param {string} phone - Telefone (apenas números)
 * @param {string} locale - Localidade (br, us)
 * @returns {string} Telefone formatado
 */
export const formatPhone = (phone, locale = 'br') => {
  if (!phone) return '';

  const cleanPhone = phone.replace(/\D/g, '');

  if (locale === 'br') {
    // Brasil: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    if (cleanPhone.length === 11) {
      return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
  }

  if (locale === 'us') {
    // EUA: (XXX) XXX-XXXX
    if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
  }

  return cleanPhone;
};

/**
 * Formata CPF/CNPJ
 * @param {string} doc - Documento (apenas números)
 * @returns {string} Documento formatado
 */
export const formatDocument = (doc) => {
  if (!doc) return '';

  const cleanDoc = doc.replace(/\D/g, '');

  // CPF: 000.000.000-00
  if (cleanDoc.length === 11) {
    return cleanDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  // CNPJ: 00.000.000/0000-00
  if (cleanDoc.length === 14) {
    return cleanDoc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  return cleanDoc;
};

/**
 * Formata CEP
 * @param {string} cep - CEP (apenas números)
 * @returns {string} CEP formatado
 */
export const formatCEP = (cep) => {
  if (!cep) return '';

  const cleanCEP = cep.replace(/\D/g, '');

  if (cleanCEP.length === 8) {
    return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  return cleanCEP;
};