// ============================================
// ROOM DOMAIN EVENTS
// ============================================
// Responsabilidade: Definir eventos relacionados a quartos
// ============================================

class DomainEvent {
  constructor(room, action, metadata = {}) {
    this.roomId = room.id;
    this.roomNumber = room.number;
    this.action = action;
    this.timestamp = new Date().toISOString();
    this.metadata = metadata;
  }
}

export class RoomOccupiedEvent extends DomainEvent {
  constructor(room, guestsCount, reservationId) {
    super(room, 'OCCUPIED', { guestsCount, reservationId });
    this.eventType = 'ROOM_OCCUPIED';
  }
}

export class RoomReleasedEvent extends DomainEvent {
  constructor(room) {
    super(room, 'RELEASED');
    this.eventType = 'ROOM_RELEASED';
  }
}

export class RoomMaintenanceEvent extends DomainEvent {
  constructor(room, reason) {
    super(room, 'MAINTENANCE', { reason });
    this.eventType = 'ROOM_MAINTENANCE';
  }
}

export class RoomCleaningEvent extends DomainEvent {
  constructor(room) {
    super(room, 'CLEANING');
    this.eventType = 'ROOM_CLEANING';
  }
}