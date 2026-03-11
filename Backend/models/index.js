// =====================================================
// HOTEL PARADISE - MODELS INDEX
// Versão: 1.0.0
// Descrição: Centraliza acesso ao banco de dados
// =====================================================

const knex = require('knex');
const knexConfig = require('../knexfile');

// =====================================================
// CONEXÃO COM BANCO DE DADOS
// =====================================================
const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];
const db = knex(config);

// =====================================================
// TESTE DE CONEXÃO
// =====================================================
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Knex conectado ao PostgreSQL com sucesso!');
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar Knex ao PostgreSQL:', err.message);
  });

// =====================================================
// MODELOS (Abstrações para queries comuns)
// =====================================================

const models = {
  // Users
  users: {
    findAll: () => db('users').select('*'),
    findById: (id) => db('users').where({ id }).first(),
    findByEmail: (email) => db('users').where({ email }).first(),
    create: (data) => db('users').insert(data).returning('*'),
    update: (id, data) => db('users').where({ id }).update(data).returning('*'),
    delete: (id) => db('users').where({ id }).del()
  },

  // Guests
  guests: {
    findAll: () => db('guests').select('*'),
    findById: (id) => db('guests').where({ id }).first(),
    findByPhone: (phone) => db('guests').where({ phone }).first(),
    findByDocument: (document) => db('guests').where({ document }).first(),
    search: (term) => db('guests')
      .where('name', 'ilike', `%${term}%`)
      .orWhere('phone', 'ilike', `%${term}%`),
    create: (data) => db('guests').insert(data).returning('*'),
    update: (id, data) => db('guests').where({ id }).update(data).returning('*'),
    delete: (id) => db('guests').where({ id }).del()
  },

  // Rooms
  rooms: {
    findAll: () => db('rooms').select('*'),
    findById: (id) => db('rooms').where({ id }).first(),
    findByNumber: (roomNumber) => db('rooms').where({ room_number: roomNumber }).first(),
    findAvailable: (checkIn, checkOut, type = null) => {
      let query = db('rooms')
        .where('status', 'available')
        .whereNotExists(function() {
          this.select('*')
            .from('reservations')
            .whereRaw('reservations.room_id = rooms.id')
            .whereIn('status', ['confirmed', 'checked_in'])
            .where(function() {
              this.whereBetween('check_in', [checkIn, checkOut])
                .orWhereBetween('check_out', [checkIn, checkOut])
                .orWhere(function() {
                  this.where('check_in', '<=', checkIn)
                    .andWhere('check_out', '>=', checkOut);
                });
            });
        });
      
      if (type) {
        query = query.where('type', type);
      }
      
      return query;
    },
    create: (data) => db('rooms').insert(data).returning('*'),
    update: (id, data) => db('rooms').where({ id }).update(data).returning('*'),
    updateStatus: (id, status) => db('rooms').where({ id }).update({ status }).returning('*'),
    delete: (id) => db('rooms').where({ id }).del()
  },

  // Reservations
  reservations: {
    findAll: (filters = {}) => {
      let query = db('reservations')
        .select(
          'reservations.*',
          'guests.name as guest_name',
          'guests.phone as guest_phone',
          'rooms.room_number',
          'rooms.type as room_type'
        )
        .leftJoin('guests', 'reservations.guest_id', 'guests.id')
        .leftJoin('rooms', 'reservations.room_id', 'rooms.id');
      
      if (filters.status) {
        query = query.where('reservations.status', filters.status);
      }
      
      if (filters.payment_status) {
        query = query.where('reservations.payment_status', filters.payment_status);
      }
      
      if (filters.startDate) {
        query = query.where('check_in', '>=', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.where('check_out', '<=', filters.endDate);
      }
      
      return query.orderBy('created_at', 'desc');
    },
    findById: (id) => db('reservations').where({ id }).first(),
    findByCode: (code) => db('reservations').where({ reservation_code: code }).first(),
    create: (data) => db('reservations').insert(data).returning('*'),
    update: (id, data) => db('reservations').where({ id }).update(data).returning('*'),
    cancel: (id, reason) => db('reservations')
      .where({ id })
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancellation_date: db.fn.now()
      })
      .returning('*'),
    checkIn: (id) => db('reservations')
      .where({ id })
      .update({
        status: 'checked_in',
        check_in_real: db.fn.now()
      })
      .returning('*'),
    checkOut: (id) => db('reservations')
      .where({ id })
      .update({
        status: 'checked_out',
        check_out_real: db.fn.now()
      })
      .returning('*')
  },

  // Payments
  payments: {
    findAll: () => db('payments').select('*'),
    findById: (id) => db('payments').where({ id }).first(),
    findByReservation: (reservationId) => db('payments').where({ reservation_id: reservationId }),
    findByCode: (code) => db('payments').where({ payment_code: code }).first(),
    create: (data) => db('payments').insert(data).returning('*'),
    update: (id, data) => db('payments').where({ id }).update(data).returning('*'),
    updateStatus: (id, status) => db('payments').where({ id }).update({ status }).returning('*')
  },

  // Receipts
  receipts: {
    findAll: () => db('receipts').select('*'),
    findById: (id) => db('receipts').where({ id }).first(),
    findByNumber: (number) => db('receipts').where({ receipt_number: number }).first(),
    findByPayment: (paymentId) => db('receipts').where({ payment_id: paymentId }),
    create: (data) => db('receipts').insert(data).returning('*'),
    update: (id, data) => db('receipts').where({ id }).update(data).returning('*')
  },

  // Audit Logs
  auditLogs: {
    findAll: (filters = {}) => {
      let query = db('audit_logs')
        .select('audit_logs.*', 'users.name as user_name')
        .leftJoin('users', 'audit_logs.user_id', 'users.id');
      
      if (filters.table_name) {
        query = query.where('audit_logs.table_name', filters.table_name);
      }
      
      if (filters.action) {
        query = query.where('audit_logs.action', filters.action);
      }
      
      return query.orderBy('created_at', 'desc');
    },
    create: (data) => db('audit_logs').insert(data).returning('*')
  },

  // Funções utilitárias
  raw: (sql, bindings) => db.raw(sql, bindings),
  transaction: (callback) => db.transaction(callback)
};

// =====================================================
// EXPORTAÇÕES
// =====================================================
module.exports = {
  db,
  models
};