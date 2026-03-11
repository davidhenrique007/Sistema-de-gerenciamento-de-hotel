/**
 * ============================================================================
 * SHARED UTILS - DATE UTILITIES
 * ============================================================================
 * 
 * Utilitários de data compartilhados em toda aplicação
 * Inclui formatação de moeda em Metical (MZN)
 * 
 * @module dateUtils
 */

// ============================================================================
// CONSTANTES DE MOEDA
// ============================================================================

export const CURRENCY = {
  MZN: 'MZN',
  SYMBOL: 'MT',
  LOCALE: 'pt-MZ', // Moçambique
};

/**
 * Formata um valor para Metical (MZN)
 * 
 * @param {number} amount - Valor a ser formatado
 * @param {Object} options - Opções de formatação
 * @returns {string} Valor formatado (ex: "3.500 MT")
 * 
 * @example
 * formatCurrency(3500) // "3.500 MT"
 * formatCurrency(1250.50) // "1.250,50 MT"
 */
export const formatCurrency = (amount, options = {}) => {
  if (amount === null || amount === undefined) return '';
  
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    showSymbol = true,
  } = options;

  try {
    const formatter = new Intl.NumberFormat(CURRENCY.LOCALE, {
      style: 'decimal',
      minimumFractionDigits,
      maximumFractionDigits,
    });

    const formattedNumber = formatter.format(amount);
    
    return showSymbol 
      ? `${formattedNumber} ${CURRENCY.SYMBOL}`
      : formattedNumber;
  } catch (error) {
    // Fallback se o locale não estiver disponível
    const formatted = amount.toLocaleString('pt-BR', {
      minimumFractionDigits,
      maximumFractionDigits,
    });
    
    return showSymbol
      ? `${formatted} ${CURRENCY.SYMBOL}`
      : formatted;
  }
};

/**
 * Formata um valor com formato de moeda completo
 * 
 * @param {number} amount - Valor a ser formatado
 * @returns {string} Valor formatado com código MZN
 * 
 * @example
 * formatCurrencyFull(3500) // "3.500,00 MZN"
 */
export const formatCurrencyFull = (amount) => {
  return formatCurrency(amount, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    showSymbol: false,
  }) + ` ${CURRENCY.MZN}`;
};

/**
 * Formata um valor sem símbolo (apenas número)
 * 
 * @param {number} amount - Valor a ser formatado
 * @returns {string} Número formatado
 */
export const formatCurrencyNumber = (amount) => {
  return formatCurrency(amount, { showSymbol: false });
};

// ============================================================================
// UTILITÁRIOS DE DATA
// ============================================================================

/**
 * Formata uma data no padrão brasileiro (dd/mm/aaaa)
 * 
 * @param {Date} date - Data a ser formatada
 * @returns {string} Data formatada
 * 
 * @example
 * formatDate(new Date()) // "04/03/2026"
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

/**
 * Formata uma data por extenso
 * 
 * @param {Date} date - Data a ser formatada
 * @returns {string} Data por extenso
 * 
 * @example
 * formatDateLong(new Date()) // "4 de março de 2026"
 */
export const formatDateLong = (date) => {
  if (!date) return '';
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

/**
 * Formata uma data para o formato ISO (aaaa-mm-dd)
 * 
 * @param {Date} date - Data a ser formatada
 * @returns {string} Data no formato ISO
 */
export const formatDateISO = (date) => {
  if (!date) return '';
  
  return date.toISOString().split('T')[0];
};

/**
 * Obtém a data de hoje com horário zerado
 * 
 * @returns {Date} Data de hoje
 */
export const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

/**
 * Verifica se uma data é anterior a hoje
 * 
 * @param {Date} date - Data a ser verificada
 * @returns {boolean} True se for anterior
 */
export const isPastDate = (date) => {
  if (!date) return false;
  
  const today = getToday();
  return date < today;
};

/**
 * Verifica se a data de check-out é válida (após check-in)
 * 
 * @param {Date} checkIn - Data de check-in
 * @param {Date} checkOut - Data de check-out
 * @returns {boolean} True se for válida
 */
export const isValidDateRange = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return false;
  
  return checkOut > checkIn;
};

/**
 * Calcula o número de noites entre duas datas
 * 
 * @param {Date} checkIn - Data de check-in
 * @param {Date} checkOut - Data de check-out
 * @returns {number} Número de noites
 */
export const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  
  const diffTime = Math.abs(checkOut - checkIn);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Adiciona dias a uma data
 * 
 * @param {Date} date - Data base
 * @param {number} days - Número de dias a adicionar
 * @returns {Date} Nova data
 */
export const addDays = (date, days) => {
  if (!date) return null;
  
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

/**
 * Verifica se uma data está dentro de um intervalo
 * 
 * @param {Date} date - Data a ser verificada
 * @param {Date} startDate - Início do intervalo
 * @param {Date} endDate - Fim do intervalo
 * @returns {boolean} True se estiver no intervalo
 */
export const isDateInRange = (date, startDate, endDate) => {
  if (!date || !startDate || !endDate) return false;
  
  return date >= startDate && date <= endDate;
};

/**
 * Gera array de datas entre duas datas
 * 
 * @param {Date} startDate - Data inicial
 * @param {Date} endDate - Data final
 * @returns {Date[]} Array de datas
 */
export const getDatesInRange = (startDate, endDate) => {
  if (!startDate || !endDate) return [];
  
  const dates = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

/**
 * Verifica se uma data está disponível (não bloqueada)
 * 
 * @param {Date} date - Data a ser verificada
 * @param {Date[]} blockedDates - Array de datas bloqueadas
 * @returns {boolean} True se disponível
 */
export const isDateAvailable = (date, blockedDates = []) => {
  if (!date) return false;
  
  return !blockedDates.some(
    (blockedDate) => blockedDate.toDateString() === date.toDateString()
  );
};

/**
 * Agrupa datas por mês/ano
 * 
 * @param {Date[]} dates - Array de datas
 * @returns {Object} Datas agrupadas
 */
export const groupDatesByMonth = (dates) => {
  return dates.reduce((acc, date) => {
    const key = `${date.getMonth()}-${date.getFullYear()}`;
    
    if (!acc[key]) {
      acc[key] = [];
    }
    
    acc[key].push(date);
    return acc;
  }, {});
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Moeda
  CURRENCY,
  formatCurrency,
  formatCurrencyFull,
  formatCurrencyNumber,
  
  // Data
  formatDate,
  formatDateLong,
  formatDateISO,
  getToday,
  isPastDate,
  isValidDateRange,
  calculateNights,
  addDays,
  isDateInRange,
  getDatesInRange,
  isDateAvailable,
  groupDatesByMonth,
};