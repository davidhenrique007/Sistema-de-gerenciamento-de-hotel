// ============================================
// HOME HOOKS BARREL
// ============================================
// Exporta todos os hooks da Home Feature
// ============================================

// Hooks de dados (Dia 24)
export { useRooms, useRoom } from './useRooms.js';
export { useHomeData, useHomePageData } from './useHomeData.js';

// Hooks de reserva (Dia 25)
export { useHomeReservation } from './useHomeReservation.js';
export { useReservationForm } from './useReservationForm.js';

// Hooks de validação e ocupação (Dia 26)
export { useReservationValidation } from './useReservationValidation.js';
export { useRoomOccupancy, OccupancyStatus } from './useRoomOccupancy.js';