/**
 * Constantes de domínio para quartos
 * 
 * Estrutura enum-like preparada para futura migração para TypeScript
 * Object.freeze() impede modificações acidentais
 */

export const ROOM_STATUS = Object.freeze({
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
});

export const ROOM_STATUS_LABELS = Object.freeze({
  [ROOM_STATUS.AVAILABLE]: 'Disponível',
  [ROOM_STATUS.OCCUPIED]: 'Ocupado',
  [ROOM_STATUS.MAINTENANCE]: 'Em manutenção',
});

export const ROOM_STATUS_COLORS = Object.freeze({
  [ROOM_STATUS.AVAILABLE]: 'success',
  [ROOM_STATUS.OCCUPIED]: 'error',
  [ROOM_STATUS.MAINTENANCE]: 'warning',
});

export const ROOM_TYPES = Object.freeze({
  STANDARD: 'standard',
  DELUXE: 'deluxe',
  EXECUTIVE: 'executive',
  FAMILY: 'family',
  PRESIDENTIAL: 'presidential',
});

export const ROOM_TYPE_LABELS = Object.freeze({
  [ROOM_TYPES.STANDARD]: 'Standard',
  [ROOM_TYPES.DELUXE]: 'Deluxe',
  [ROOM_TYPES.EXECUTIVE]: 'Executivo',
  [ROOM_TYPES.FAMILY]: 'Família',
  [ROOM_TYPES.PRESIDENTIAL]: 'Presidencial',
});

export const CURRENCY_TYPES = Object.freeze({
  MZN: 'MZN',
  USD: 'USD',
  EUR: 'EUR',
});

export const CURRENCY_SYMBOLS = Object.freeze({
  [CURRENCY_TYPES.MZN]: 'MT',
  [CURRENCY_TYPES.USD]: '$',
  [CURRENCY_TYPES.EUR]: '€',
});

export const AMENITIES = Object.freeze({
  WIFI: 'Wi-Fi',
  TV: 'TV',
  AIR_CONDITIONING: 'Ar condicionado',
  MINIBAR: 'Frigobar',
  SAFE: 'Cofre',
  BALCONY: 'Varanda',
  SEA_VIEW: 'Vista mar',
  WORK_DESK: 'Mesa de trabalho',
  BATH_TUB: 'Banheira',
  JACUZZI: 'Jacuzzi',
  LIVING_ROOM: 'Sala de estar',
});

export default {
  ROOM_STATUS,
  ROOM_STATUS_LABELS,
  ROOM_STATUS_COLORS,
  ROOM_TYPES,
  ROOM_TYPE_LABELS,
  CURRENCY_TYPES,
  CURRENCY_SYMBOLS,
  AMENITIES,
};