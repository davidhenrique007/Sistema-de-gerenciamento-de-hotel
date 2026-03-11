// =====================================================
// Seed: Insert initial users
// =====================================================

const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const receptionistPassword = await bcrypt.hash('receptionist123', salt);

  // Insert users
  await knex('users').insert([
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Administrador',
      email: 'admin@hotelparadise.com',
      password_hash: adminPassword,
      role: 'admin',
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Recepcionista',
      email: 'recepcao@hotelparadise.com',
      password_hash: receptionistPassword,
      role: 'receptionist',
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);
};