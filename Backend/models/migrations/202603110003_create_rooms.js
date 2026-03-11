// =====================================================
// Migration: Create rooms table
// =====================================================

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const exists = await knex.schema.hasTable('rooms');
  if (exists) return;

  await knex.schema.createTable('rooms', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('room_number', 10).notNullable().unique();
    table.string('type', 50).notNullable();
    table.decimal('price_per_night', 10, 2).notNullable();
    table.integer('capacity_adults').notNullable().defaultTo(2);
    table.integer('capacity_children').notNullable().defaultTo(0);
    table.decimal('size_sqm', 5, 2);
    table.string('bed_type', 50);
    table.string('status', 20).defaultTo('available');
    table.integer('floor');
    table.text('description');
    table.jsonb('amenities').defaultTo('{}');
    table.jsonb('images').defaultTo('[]');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Constraints
    table.check("type IN ('standard', 'deluxe', 'family', 'suite', 'presidential')", [], 'room_type_check');
    table.check("price_per_night > 0", [], 'positive_price_check');
    table.check('capacity_adults > 0 AND capacity_children >= 0', [], 'valid_capacity_check');
    table.check("bed_type IS NULL OR bed_type IN ('single', 'double', 'queen', 'king', 'twin')", [], 'bed_type_check');
    table.check("status IN ('available', 'occupied', 'maintenance', 'reserved', 'cleaning')", [], 'status_check');
    table.check('floor >= 0', [], 'valid_floor_check');
  });

  // Índices
  await knex.schema.raw('CREATE INDEX idx_rooms_status ON rooms(status)');
  await knex.schema.raw('CREATE INDEX idx_rooms_type ON rooms(type)');
  await knex.schema.raw('CREATE INDEX idx_rooms_floor ON rooms(floor)');
  await knex.schema.raw('CREATE INDEX idx_rooms_type_status ON rooms(type, status)');
  await knex.schema.raw('CREATE INDEX idx_rooms_available ON rooms(id) WHERE status = \'available\'');

  // Trigger para updated_at
  await knex.schema.raw(`
    CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('rooms');
};