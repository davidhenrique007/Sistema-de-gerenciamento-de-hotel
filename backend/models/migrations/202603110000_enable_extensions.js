// =====================================================
// Migration: Enable PostgreSQL extensions
// =====================================================

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Habilitar extensão para busca textual
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pg_trgm"');
  
  console.log('✅ Extensões habilitadas: uuid-ossp, pg_trgm');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Remover extensões (cuidado: pode afetar outras tabelas)
  await knex.raw('DROP EXTENSION IF EXISTS "pg_trgm"');
  await knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
};