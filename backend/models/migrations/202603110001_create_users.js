// =====================================================
// Migration: Create users table
// =====================================================

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const exists = await knex.schema.hasTable('users');
  if (exists) return;

  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable();
    table.string('email', 100).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('role', 20).notNullable().checkIn(['admin', 'receptionist', 'financial']);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_login');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Constraints
    table.check('LENGTH(name) >= 3', [], 'name_length_check');
    table.check("email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'", [], 'email_format_check');
  });

  // Índices
  await knex.schema.raw('CREATE INDEX idx_users_email ON users(email)');
  await knex.schema.raw('CREATE INDEX idx_users_role ON users(role)');
  await knex.schema.raw('CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true');

  // Trigger para updated_at
  await knex.schema.raw(`
    CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('users');
};