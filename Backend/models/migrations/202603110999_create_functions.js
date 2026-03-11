// =====================================================
// Migration: Create database functions and triggers
// =====================================================

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Função para atualizar updated_at
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Função para gerar código de reserva
  await knex.raw(`
    CREATE OR REPLACE FUNCTION generate_reservation_code()
    RETURNS TRIGGER AS $$
    DECLARE
      year_prefix TEXT;
      next_number INT;
    BEGIN
      year_prefix := 'RES-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-';
      
      SELECT COALESCE(MAX(CAST(SUBSTRING(reservation_code FROM LENGTH(year_prefix)+1) AS INTEGER)), 0) + 1
      INTO next_number
      FROM reservations
      WHERE reservation_code LIKE year_prefix || '%';
      
      NEW.reservation_code := year_prefix || LPAD(next_number::TEXT, 4, '0');
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Trigger para gerar código de reserva automaticamente
  await knex.raw(`
    CREATE TRIGGER trigger_generate_reservation_code
    BEFORE INSERT ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION generate_reservation_code();
  `);

  // Função para gerar código de pagamento
  await knex.raw(`
    CREATE OR REPLACE FUNCTION generate_payment_code()
    RETURNS TRIGGER AS $$
    DECLARE
      year_prefix TEXT;
      next_number INT;
    BEGIN
      year_prefix := 'PAY-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-';
      
      SELECT COALESCE(MAX(CAST(SUBSTRING(payment_code FROM LENGTH(year_prefix)+1) AS INTEGER)), 0) + 1
      INTO next_number
      FROM payments
      WHERE payment_code LIKE year_prefix || '%';
      
      NEW.payment_code := year_prefix || LPAD(next_number::TEXT, 4, '0');
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Trigger para gerar código de pagamento automaticamente
  await knex.raw(`
    CREATE TRIGGER trigger_generate_payment_code
    BEFORE INSERT ON payments
    FOR EACH ROW
    EXECUTE FUNCTION generate_payment_code();
  `);

  // Função para gerar número de recibo
  await knex.raw(`
    CREATE OR REPLACE FUNCTION generate_receipt_number()
    RETURNS TRIGGER AS $$
    DECLARE
      year_prefix TEXT;
      next_number INT;
    BEGIN
      year_prefix := 'REC-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-';
      
      SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM LENGTH(year_prefix)+1) AS INTEGER)), 0) + 1
      INTO next_number
      FROM receipts
      WHERE receipt_number LIKE year_prefix || '%';
      
      NEW.receipt_number := year_prefix || LPAD(next_number::TEXT, 4, '0');
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Trigger para gerar número de recibo automaticamente
  await knex.raw(`
    CREATE TRIGGER trigger_generate_receipt_number
    BEFORE INSERT ON receipts
    FOR EACH ROW
    EXECUTE FUNCTION generate_receipt_number();
  `);

  // Função de auditoria
  await knex.raw(`
    CREATE OR REPLACE FUNCTION audit_trigger_function()
    RETURNS TRIGGER AS $$
    BEGIN
      IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, new_data)
        VALUES (
          NULLIF(current_setting('app.current_user_id', true), '')::UUID,
          'INSERT',
          TG_TABLE_NAME,
          NEW.id,
          row_to_json(NEW)
        );
        RETURN NEW;
      ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
        VALUES (
          NULLIF(current_setting('app.current_user_id', true), '')::UUID,
          'UPDATE',
          TG_TABLE_NAME,
          NEW.id,
          row_to_json(OLD),
          row_to_json(NEW)
        );
        RETURN NEW;
      ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data)
        VALUES (
          NULLIF(current_setting('app.current_user_id', true), '')::UUID,
          'DELETE',
          TG_TABLE_NAME,
          OLD.id,
          row_to_json(OLD)
        );
        RETURN OLD;
      END IF;
      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Triggers de auditoria
  await knex.raw(`
    CREATE TRIGGER audit_reservations AFTER INSERT OR UPDATE OR DELETE ON reservations
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
  `);

  await knex.raw(`
    CREATE TRIGGER audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
  `);

  await knex.raw(`
    CREATE TRIGGER audit_guests AFTER INSERT OR UPDATE OR DELETE ON guests
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.raw('DROP TRIGGER IF EXISTS audit_guests ON guests');
  await knex.raw('DROP TRIGGER IF EXISTS audit_payments ON payments');
  await knex.raw('DROP TRIGGER IF EXISTS audit_reservations ON reservations');
  await knex.raw('DROP FUNCTION IF EXISTS audit_trigger_function()');
  await knex.raw('DROP TRIGGER IF EXISTS trigger_generate_receipt_number ON receipts');
  await knex.raw('DROP FUNCTION IF EXISTS generate_receipt_number()');
  await knex.raw('DROP TRIGGER IF EXISTS trigger_generate_payment_code ON payments');
  await knex.raw('DROP FUNCTION IF EXISTS generate_payment_code()');
  await knex.raw('DROP TRIGGER IF EXISTS trigger_generate_reservation_code ON reservations');
  await knex.raw('DROP FUNCTION IF EXISTS generate_reservation_code()');
  await knex.raw('DROP FUNCTION IF EXISTS update_updated_at_column()');
};