// =====================================================
// Migration: Create receipts table
// =====================================================

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const exists = await knex.schema.hasTable('receipts');
  if (exists) return;

  await knex.schema.createTable('receipts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('receipt_number', 50).notNullable().unique();
    table.uuid('payment_id').notNullable();
    table.string('receipt_type', 20).defaultTo('payment');
    table.string('pdf_url', 255);
    table.text('xml_content');
    table.boolean('sent_to_email').defaultTo(false);
    table.boolean('sent_to_whatsapp').defaultTo(false);
    table.timestamp('sent_at');
    table.timestamp('downloaded_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Foreign Keys
    table.foreign('payment_id').references('id').inTable('payments').onDelete('CASCADE');

    // Constraints
    table.check("receipt_type IN ('payment', 'cancellation', 'refund')", [], 'receipt_type_check');
  });

  // Índices
  await knex.schema.raw('CREATE INDEX idx_receipts_number ON receipts(receipt_number)');
  await knex.schema.raw('CREATE INDEX idx_receipts_payment ON receipts(payment_id)');

  // Trigger para updated_at
  await knex.schema.raw(`
    CREATE TRIGGER update_receipts_updated_at
    BEFORE UPDATE ON receipts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('receipts');
};