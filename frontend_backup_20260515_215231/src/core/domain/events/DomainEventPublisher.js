// ============================================
// DOMAIN EVENT PUBLISHER
// ============================================
// Responsabilidade: Publicar eventos de domínio
// Aplica DIP (Dependency Inversion Principle)
// ============================================

export class DomainEventPublisher {
  constructor() {
    this.subscribers = new Map();
  }

  subscribe(eventType, handler) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType).push(handler);
  }

  publish(event) {
    const handlers = this.subscribers.get(event.eventType) || [];
    handlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error handling event ${event.eventType}:`, error);
      }
    });
  }

  unsubscribe(eventType, handler) {
    const handlers = this.subscribers.get(eventType);
    if (handlers) {
      this.subscribers.set(
        eventType, 
        handlers.filter(h => h !== handler)
      );
    }
  }
}