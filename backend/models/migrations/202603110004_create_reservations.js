// =====================================================
// Migration: Create reservations table
// =====================================================

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const exists = await knex.schema.hasTable('reservations');
  if (exists) return;

  await knex.schema.createTable('reservations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('reservation_code', 20).notNullable().unique();
    table.uuid('guest_id').notNullable();
    table.uuid('room_id').notNullable();
    table.uuid('user_id').notNullable();
    table.date('check_in').notNullable();
    table.date('check_out').notNullable();
    table.timestamp('check_in_real');
    table.timestamp('check_out_real');
    table.integer('adults_count').notNullable().defaultTo(1);
    table.integer('children_count').notNullable().defaultTo(0);
    table.decimal('base_price', 10, 2).notNullable();
    table.decimal('discount_amount', 10, 2).defaultTo(0);
    table.decimal('tax_amount', 10, 2).defaultTo(0);
    // REMOVIDO: table.decimal('total_price').generatedAlwaysAs...
    table.decimal('total_price', 10, 2); // Será calculado no serviço
    table.string('status', 20).defaultTo('pending');
    table.string('payment_status', 20).defaultTo('pending');
    table.text('cancellation_reason');
    table.timestamp('cancellation_date');
    table.text('special_requests');
    table.string('source', 20).defaultTo('website');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Foreign Keys
    table.foreign('guest_id').references('id').inTable('guests').onDelete('RESTRICT');
    table.foreign('room_id').references('id').inTable('rooms').onDelete('RESTRICT');
    table.foreign('user_id').references('id').inTable('users').onDelete('RESTRICT');

    // Constraints
    table.check('check_out > check_in', [], 'valid_dates_check');
    table.check('adults_count >= 1 AND children_count >= 0', [], 'valid_guests_check');
    table.check('base_price > 0 AND discount_amount >= 0 AND tax_amount >= 0', [], 'positive_prices_check');
    table.check("status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show')", [], 'status_check');
    table.check("payment_status IN ('pending', 'partial', 'paid', 'refunded')", [], 'payment_status_check');
    table.check("source IN ('website', 'reception', 'phone', 'email', 'booking_platform')", [], 'source_check');
  });

  // Índices
  await knex.schema.raw('CREATE INDEX idx_reservations_dates ON reservations(check_in, check_out)');
  await knex.schema.raw('CREATE INDEX idx_reservations_guest ON reservations(guest_id)');
  await knex.schema.raw('CREATE INDEX idx_reservations_room ON reservations(room_id)');
  await knex.schema.raw('CREATE INDEX idx_reservations_status ON reservations(status)');
  await knex.schema.raw('CREATE INDEX idx_reservations_code ON reservations(reservation_code)');
  await knex.schema.raw('CREATE INDEX idx_reservations_current ON reservations(room_id, status) WHERE status IN (\'confirmed\', \'checked_in\')');
  await knex.schema.raw('CREATE INDEX idx_reservations_checkin_status ON reservations(check_in, status) WHERE status != \'cancelled\'');

  // Trigger para updated_at
  await knex.schema.raw(`
    CREATE TRIGGER update_reservations_updated_at
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('reservations');
};