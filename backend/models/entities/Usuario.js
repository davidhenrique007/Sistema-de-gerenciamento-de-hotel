// =====================================================
// HOTEL PARADISE - MODELO DE USUÁRIO
// Versão: 1.0.0
// =====================================================

const { Model } = require('objection');
const bcrypt = require('bcryptjs');

class Usuario extends Model {
  static get tableName() {
    return 'users';
  }

  static get idColumn() {
    return 'id';
  }

  // Validações e formatações antes de inserir/atualizar
  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext);
    this.created_at = new Date();
    this.updated_at = new Date();
    
    // Hash da senha se fornecida
    if (this.password_hash) {
      this.password_hash = await bcrypt.hash(this.password_hash, 10);
    }
  }

  async $beforeUpdate(opt, queryContext) {
    await super.$beforeUpdate(opt, queryContext);
    this.updated_at = new Date();
    
    // Hash da senha se foi alterada
    if (this.password_hash && !this.password_hash.startsWith('$2a$')) {
      this.password_hash = await bcrypt.hash(this.password_hash, 10);
    }
  }

  // Método para verificar senha
  async verifyPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }

  // Método para retornar dados sem senha
  toJSON() {
    const { password_hash, ...userData } = super.toJSON();
    return userData;
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'email', 'password_hash', 'role'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string', minLength: 3, maxLength: 100 },
        email: { type: 'string', format: 'email', maxLength: 100 },
        password_hash: { type: 'string', minLength: 60, maxLength: 255 },
        role: { type: 'string', enum: ['admin', 'receptionist', 'financial'] },
        is_active: { type: 'boolean', default: true },
        last_login: { type: ['string', 'null'], format: 'date-time' },
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
          from: 'users.id',
          to: 'reservations.user_id'
        }
      }
    };
  }
}

module.exports = Usuario;

