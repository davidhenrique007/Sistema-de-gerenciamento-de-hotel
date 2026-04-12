// =====================================================
// Migration: Create guests table
// =====================================================

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    const exists = await knex.schema.hasTable('guests');
    if (exists) return;

    await knex.schema.createTable('guests', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('name', 100).notNullable();
        table.string('email', 100);
        table.string('phone', 20).notNullable().unique();
        table.string('document', 20).unique();
        table.date('birth_date');
        table.string('address_street', 255);
        table.string('address_number', 10);
        table.string('address_complement', 50);
        table.string('address_neighborhood', 100);
        table.string('address_city', 100);
        table.string('address_state', 2);
        table.string('address_zipcode', 10);
        table.string('address_country', 50).defaultTo('Brasil');
        table.text('observations');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        // Constraints
        table.check("phone ~* '^[0-9+\\-\\s()]{10,20}$'", [], 'phone_format_check');
        table.check("email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'", [], 'email_format_check');
        table.check("document IS NULL OR document ~* '^[0-9]{11}$' OR document ~* '^[0-9]{14}$'", [], 'document_format_check');
    });

    // Índices
    await knex.schema.raw('CREATE INDEX idx_guests_phone ON guests(phone)');
    await knex.schema.raw('CREATE INDEX idx_guests_email ON guests(email) WHERE email IS NOT NULL');
    await knex.schema.raw('CREATE INDEX idx_guests_document ON guests(document) WHERE document IS NOT NULL');

    // Trigger para updated_at
    await knex.schema.raw(`
    CREATE TRIGGER update_guests_updated_at
    BEFORE UPDATE ON guests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('guests');
};