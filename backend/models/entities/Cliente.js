// =====================================================
// HOTEL PARADISE - MODELO DE CLIENTE
// Versão: 1.0.0
// =====================================================

const { Model } = require('objection');

class Cliente extends Model {
  static get tableName() {
    return 'guests';
  }

  static get idColumn() {
    return 'id';
  }

  async $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  async $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  // Formatar telefone para armazenamento (apenas números)
  static formatPhone(phone) {
    return phone.replace(/\D/g, '');
  }

  // Formatar documento para armazenamento (apenas números)
  static formatDocument(doc) {
    if (!doc) return null;
    return doc.replace(/\D/g, '');
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'phone'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string', minLength: 3, maxLength: 100 },
        email: { type: 'string', format: 'email', maxLength: 100 },
        phone: { type: 'string', minLength: 9, maxLength: 20 },
        document: { type: ['string', 'null'], minLength: 9, maxLength: 20 },
        birth_date: { type: ['string', 'null'], format: 'date' },
        address_street: { type: ['string', 'null'], maxLength: 255 },
        address_number: { type: ['string', 'null'], maxLength: 10 },
        address_complement: { type: ['string', 'null'], maxLength: 50 },
        address_neighborhood: { type: ['string', 'null'], maxLength: 100 },
        address_city: { type: ['string', 'null'], maxLength: 100 },
        address_state: { type: ['string', 'null'], maxLength: 2 },
        address_zipcode: { type: ['string', 'null'], maxLength: 10 },
        address_country: { type: 'string', maxLength: 50, default: 'Brasil' },
        observations: { type: ['string', 'null'] },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const Reserva = require('./Reserva.js');
    
    return {
      reservations: {
        relation: Model.HasManyRelation,
        modelClass: Reserva,
        join: {
          from: 'guests.id',
          to: 'reservations.guest_id'
        }
      }
    };
  }

  // Método para retornar dados sem campos sensíveis
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      document: this.document,
      birth_date: this.birth_date,
      address: {
        street: this.address_street,
        number: this.address_number,
        complement: this.address_complement,
        neighborhood: this.address_neighborhood,
        city: this.address_city,
        state: this.address_state,
        zipcode: this.address_zipcode,
        country: this.address_country
      },
      observations: this.observations,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Cliente;