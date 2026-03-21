// =====================================================
// HOTEL PARADISE - MODELO DE QUARTO
// =====================================================

const { Model } = require('objection');

class Quarto extends Model {
  static get tableName() {
    return 'rooms';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['room_number', 'type', 'price_per_night', 'status'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        room_number: { type: 'string', minLength: 1, maxLength: 10 },
        type: { type: 'string', enum: ['standard', 'deluxe', 'family', 'suite', 'presidential'] },
        price_per_night: { type: 'number', minimum: 0 },
        capacity_adults: { type: 'integer', minimum: 1 },
        capacity_children: { type: 'integer', minimum: 0 },
        status: { type: 'string', enum: ['available', 'occupied', 'maintenance', 'reserved', 'cleaning'] },
        floor: { type: 'integer', minimum: 0 },
        description: { type: 'string' },
        amenities: { type: 'object' },
        images: { type: 'array' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  // Método para retornar dados formatados
  toJSON() {
    return {
      id: this.id,
      room_number: this.room_number,
      type: this.type,
      price_per_night: this.price_per_night,
      capacity_adults: this.capacity_adults,
      capacity_children: this.capacity_children,
      total_capacity: (this.capacity_adults || 0) + (this.capacity_children || 0),
      status: this.status,
      floor: this.floor,
      description: this.description,
      amenities: this.amenities,
      images: this.images,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Quarto;
