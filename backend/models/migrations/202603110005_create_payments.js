// =====================================================
// Migration: Create payments table
// =====================================================

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const exists = await knex.schema.hasTable('payments');
  if (exists) return;

  await knex.schema.createTable('payments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('payment_code', 20).notNullable().unique();
    table.uuid('reservation_id').notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table.string('method', 30).notNullable();
    table.integer('installments').defaultTo(1);
    table.string('status', 20).defaultTo('pending');
    table.string('transaction_id', 100);
    table.jsonb('gateway_response');
    table.timestamp('payment_date');
    table.timestamp('refund_date');
    table.text('refund_reason');
    table.text('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Foreign Keys
    table.foreign('reservation_id').references('id').inTable('reservations').onDelete('CASCADE');

    // Constraints
    table.check("method IN ('mpesa', 'credit_card', 'debit_card', 'cash', 'bank_transfer', 'pix')", [], 'method_check');
    table.check('installments >= 1', [], 'installments_check');
    table.check("status IN ('pending', 'processing', 'approved', 'failed', 'refunded', 'chargeback')", [], 'status_check');
    table.check('amount > 0', [], 'positive_amount_check');
  });

  // Índices
  await knex.schema.raw('CREATE INDEX idx_payments_reservation ON payments(reservation_id)');
  await knex.schema.raw('CREATE INDEX idx_payments_status ON payments(status)');
  await knex.schema.raw('CREATE INDEX idx_payments_method ON payments(method)');
  await knex.schema.raw('CREATE INDEX idx_payments_code ON payments(payment_code)');
  await knex.schema.raw('CREATE INDEX idx_payments_date_status ON payments(payment_date, status) WHERE status = \'approved\'');

  // Trigger para updated_at
  await knex.schema.raw(`
    CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('payments');
};