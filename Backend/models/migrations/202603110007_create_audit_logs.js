// =====================================================
// Migration: Create audit_logs table
// =====================================================

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const exists = await knex.schema.hasTable('audit_logs');
  if (exists) return;

  await knex.schema.createTable('audit_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id');
    table.string('action', 50).notNullable();
    table.string('table_name', 50).notNullable();
    table.uuid('record_id').notNullable();
    table.jsonb('old_data');
    table.jsonb('new_data');
    table.specificType('ip_address', 'INET');
    table.text('user_agent');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Foreign Keys
    table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL');
  });

  // Índices
  await knex.schema.raw('CREATE INDEX idx_audit_logs_table ON audit_logs(table_name)');
  await knex.schema.raw('CREATE INDEX idx_audit_logs_user ON audit_logs(user_id)');
  await knex.schema.raw('CREATE INDEX idx_audit_logs_date ON audit_logs(created_at DESC)');
  await knex.schema.raw('CREATE INDEX idx_audit_logs_table_action ON audit_logs(table_name, action, created_at DESC)');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('audit_logs');
};