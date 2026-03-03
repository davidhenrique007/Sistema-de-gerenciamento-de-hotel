/**
 * Dados mockados para desenvolvimento inicial
 * 
 * Este arquivo simula dados de API para permitir desenvolvimento
 * paralelo do front-end sem dependência do back-end.
 * 
 * Quando a API estiver pronta, estes dados serão substituídos
 * por chamadas HTTP.
 */

// ============================================================================
// CONSTANTES E ENUMS
// ============================================================================

export const ROOM_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
};

export const ROOM_TYPES = {
  STANDARD: 'standard',
  DELUXE: 'deluxe',
  EXECUTIVE: 'executive',
  FAMILY: 'family',
  PRESIDENTIAL: 'presidential',
};

export const ROOM_TYPE_LABELS = {
  [ROOM_TYPES.STANDARD]: 'Standard',
  [ROOM_TYPES.DELUXE]: 'Deluxe',
  [ROOM_TYPES.EXECUTIVE]: 'Executivo',
  [ROOM_TYPES.FAMILY]: 'Família',
  [ROOM_TYPES.PRESIDENTIAL]: 'Presidencial',
};

export const AMENITIES = {
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
};

// ============================================================================
// DADOS DOS QUARTOS
// ============================================================================

export const ROOMS = [
  {
    id: 1,
    number: '101',
    type: ROOM_TYPES.STANDARD,
    typeLabel: ROOM_TYPE_LABELS[ROOM_TYPES.STANDARD],
    capacity: 2,
    pricePerNight: 3000,
    pricePerNightFormatted: '3.000 MZN',
    status: ROOM_STATUS.AVAILABLE,
    amenities: [
      AMENITIES.WIFI,
      AMENITIES.TV,
      AMENITIES.AIR_CONDITIONING,
    ],
    mainImage: '/assets/images/rooms/standard/main.jpg',
    description: 'Quarto aconchegante com vista para o jardim, ideal para casais.',
    bedType: 'Cama de casal',
    size: '25m²',
    floor: 1,
  },
  {
    id: 2,
    number: '102',
    type: ROOM_TYPES.DELUXE,
    typeLabel: ROOM_TYPE_LABELS[ROOM_TYPES.DELUXE],
    capacity: 3,
    pricePerNight: 4000,
    pricePerNightFormatted: '4.000 MZN',
    status: ROOM_STATUS.AVAILABLE,
    amenities: [
      AMENITIES.WIFI,
      AMENITIES.TV,
      AMENITIES.AIR_CONDITIONING,
      AMENITIES.MINIBAR,
    ],
    mainImage: '/assets/images/rooms/deluxe/main.jpg',
    description: 'Quarto espaçoso com varanda e amenities premium.',
    bedType: '2 camas de solteiro + 1 cama de casal',
    size: '35m²',
    floor: 1,
  },
  {
    id: 3,
    number: '201',
    type: ROOM_TYPES.EXECUTIVE,
    typeLabel: ROOM_TYPE_LABELS[ROOM_TYPES.EXECUTIVE],
    capacity: 4,
    pricePerNight: 5000,
    pricePerNightFormatted: '5.000 MZN',
    status: ROOM_STATUS.AVAILABLE,
    amenities: [
      AMENITIES.WIFI,
      AMENITIES.TV,
      AMENITIES.AIR_CONDITIONING,
      AMENITIES.MINIBAR,
      AMENITIES.SAFE,
      AMENITIES.WORK_DESK,
    ],
    mainImage: '/assets/images/rooms/executive/main.jpg',
    description: 'Quarto executivo com área de trabalho e amenities VIP.',
    bedType: '2 camas de casal',
    size: '45m²',
    floor: 2,
  },
  {
    id: 4,
    number: '301',
    type: ROOM_TYPES.FAMILY,
    typeLabel: ROOM_TYPE_LABELS[ROOM_TYPES.FAMILY],
    capacity: 5,
    pricePerNight: 7000,
    pricePerNightFormatted: '7.000 MZN',
    status: ROOM_STATUS.OCCUPIED, // Quarto ocupado
    amenities: [
      AMENITIES.WIFI,
      AMENITIES.TV,
      AMENITIES.AIR_CONDITIONING,
      AMENITIES.MINIBAR,
      AMENITIES.SAFE,
      AMENITIES.BALCONY,
      AMENITIES.SEA_VIEW,
    ],
    mainImage: '/assets/images/rooms/family/main.jpg',
    description: 'Quarto familiar com espaço para todos, perfeito para férias.',
    bedType: '2 camas de casal + 1 cama de solteiro',
    size: '60m²',
    floor: 3,
  },
  {
    id: 5,
    number: '401',
    type: ROOM_TYPES.PRESIDENTIAL,
    typeLabel: ROOM_TYPE_LABELS[ROOM_TYPES.PRESIDENTIAL],
    capacity: 6,
    pricePerNight: 12000,
    pricePerNightFormatted: '12.000 MZN',
    status: ROOM_STATUS.AVAILABLE,
    amenities: [
      AMENITIES.WIFI,
      AMENITIES.TV,
      AMENITIES.AIR_CONDITIONING,
      AMENITIES.MINIBAR,
      AMENITIES.SAFE,
      AMENITIES.BALCONY,
      AMENITIES.SEA_VIEW,
      AMENITIES.BATH_TUB,
      AMENITIES.JACUZZI,
    ],
    mainImage: '/assets/images/rooms/presidential/main.jpg',
    description: 'A suíte presidencial oferece o máximo em luxo e conforto.',
    bedType: '2 camas de casal king + sala de estar',
    size: '100m²',
    floor: 4,
  },
];

// ============================================================================
// DADOS DOS SERVIÇOS
// ============================================================================

export const SERVICES = [
  {
    id: 1,
    name: 'Café da manhã',
    description: 'Café da manhã completo com opções regionais',
    price: 350,
    priceFormatted: '350 MZN',
    type: 'daily', // por diária
    icon: '☕',
    category: 'food',
  },
  {
    id: 2,
    name: 'Almoço',
    description: 'Almoço executivo no restaurante do hotel',
    price: 600,
    priceFormatted: '600 MZN',
    type: 'daily',
    icon: '🍽️',
    category: 'food',
  },
  {
    id: 3,
    name: 'Jantar',
    description: 'Jantar especial com menu degustação',
    price: 800,
    priceFormatted: '800 MZN',
    type: 'daily',
    icon: '🍷',
    category: 'food',
  },
  {
    id: 4,
    name: 'Estacionamento',
    description: 'Vaga coberta com segurança 24h',
    price: 200,
    priceFormatted: '200 MZN',
    type: 'daily',
    icon: '🅿️',
    category: 'convenience',
  },
  {
    id: 5,
    name: 'Passeio de barco',
    description: 'Passeio de barco pelas ilhas (4h)',
    price: 2500,
    priceFormatted: '2.500 MZN',
    type: 'stay', // por estadia
    icon: '⛵',
    category: 'activity',
  },
];

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Retorna lista de quartos disponíveis
 */
export const getAvailableRooms = () => {
  return ROOMS.filter(room => room.status === ROOM_STATUS.AVAILABLE);
};

/**
 * Retorna quarto por ID
 * @param {number} id - ID do quarto
 */
export const getRoomById = (id) => {
  return ROOMS.find(room => room.id === id);
};

/**
 * Retorna serviço por ID
 * @param {number} id - ID do serviço
 */
export const getServiceById = (id) => {
  return SERVICES.find(service => service.id === id);
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  ROOMS,
  SERVICES,
  ROOM_STATUS,
  ROOM_TYPES,
  ROOM_TYPE_LABELS,
  AMENITIES,
  getAvailableRooms,
  getRoomById,
  getServiceById,
};