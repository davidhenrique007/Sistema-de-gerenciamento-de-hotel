// =====================================================
// HOTEL PARADISE - MODELS INDEX (CORRIGIDO)
// =====================================================

const knex = require('knex');
const knexConfig = require('../knexfile');
const { Model } = require('objection');

// Configuração do ambiente
const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

// Inicializar Knex
const db = knex(config);

// Configurar Objection
Model.knex(db);

// =====================================================
// MODELOS
// =====================================================

const models = {
  users: {
    findAll: () => db('users').select('*'),
    findById: (id) => db('users').where({ id }).first(),
    findByEmail: (email) => db('users').where({ email }).first(),
    create: async (data) => {
      // Converter datas para string ISO
      if (data.last_login && data.last_login instanceof Date) {
        data.last_login = data.last_login.toISOString();
      }
      const [user] = await db('users').insert(data).returning('*');
      return user;
    },
    update: async (id, data) => {
      // Converter datas para string ISO
      if (data.last_login && data.last_login instanceof Date) {
        data.last_login = data.last_login.toISOString();
      }
      const [user] = await db('users').where({ id }).update(data).returning('*');
      return user;
    },
    delete: (id) => db('users').where({ id }).del()
  },

  guests: {
    findAll: () => db('guests').select('*'),
    findById: (id) => db('guests').where({ id }).first(),
    findByPhone: (phone) => db('guests').where({ phone }).first(),
    findByDocument: (document) => db('guests').where({ document }).first(),
    create: (data) => db('guests').insert(data).returning('*'),
    update: (id, data) => db('guests').where({ id }).update(data).returning('*'),
    delete: (id) => db('guests').where({ id }).del()
  },

  rooms: {
    findAll: () => db('rooms').select('*'),
    findById: (id) => db('rooms').where({ id }).first(),
    findByNumber: (roomNumber) => db('rooms').where({ room_number: roomNumber }).first(),
    create: (data) => db('rooms').insert(data).returning('*'),
    update: (id, data) => db('rooms').where({ id }).update(data).returning('*'),
    delete: (id) => db('rooms').where({ id }).del()
  },

  reservations: {
    findAll: (filters = {}) => {
      let query = db('reservations')
        .select('reservations.*', 'guests.name as guest_name', 'rooms.room_number')
        .leftJoin('guests', 'reservations.guest_id', 'guests.id')
        .leftJoin('rooms', 'reservations.room_id', 'rooms.id');
      
      if (filters.status) query = query.where('reservations.status', filters.status);
      return query.orderBy('created_at', 'desc');
    },
    findById: (id) => db('reservations').where({ id }).first(),
    findByCode: (code) => db('reservations').where({ reservation_code: code }).first(),
    create: (data) => db('reservations').insert(data).returning('*'),
    update: (id, data) => db('reservations').where({ id }).update(data).returning('*')
  },

  payments: {
    findAll: () => db('payments').select('*'),
    findById: (id) => db('payments').where({ id }).first(),
    findByReservation: (reservationId) => db('payments').where({ reservation_id: reservationId }),
    create: (data) => db('payments').insert(data).returning('*'),
    update: (id, data) => db('payments').where({ id }).update(data).returning('*')
  },

  receipts: {
    findAll: () => db('receipts').select('*'),
    findById: (id) => db('receipts').where({ id }).first(),
    findByPayment: (paymentId) => db('receipts').where({ payment_id: paymentId }),
    create: (data) => db('receipts').insert(data).returning('*')
  }
};

// =====================================================
// EXPORTAÇÕES
// =====================================================
module.exports = {
  db,
  models,
  knex: db
};
