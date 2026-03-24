// =====================================================
// HOTEL PARADISE - KNEX CONFIGURAÇÃO DE TESTE
// =====================================================

require('dotenv').config();
const path = require('path');

module.exports = {
  test: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME_TEST || 'hotel_paradise_test'
    },
    pool: {
      min: 1,
      max: 5
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.join(__dirname, 'models', 'migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'seeds')
    }
  }
};