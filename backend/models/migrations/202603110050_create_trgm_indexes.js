// =====================================================
// Migration: Create pg_trgm indexes
// =====================================================

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Agora a extensão já está habilitada, podemos criar os índices
  await knex.schema.raw('CREATE INDEX idx_guests_name_trgm ON guests USING gin(name gin_trgm_ops)');
  
  // Outros índices que dependem de pg_trgm podem vir aqui
  console.log('✅ Índices pg_trgm criados');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.raw('DROP INDEX IF EXISTS idx_guests_name_trgm');
};