// =====================================================
// Seed: Insert room types reference
// =====================================================

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('rooms').del();

  // Insert rooms
  await knex('rooms').insert([
    {
      id: knex.raw('gen_random_uuid()'),
      room_number: '101',
      type: 'standard',
      price_per_night: 150.00,
      capacity_adults: 2,
      capacity_children: 1,
      size_sqm: 25,
      bed_type: 'double',
      status: 'available',
      floor: 1,
      description: 'Quarto padrão com cama de casal e varanda',
      amenities: JSON.stringify({
        wifi: true,
        tv: true,
        ar: true,
        frigobar: true,
        cofre: false
      }),
      images: JSON.stringify([
        '/images/rooms/standard/1.jpg',
        '/images/rooms/standard/2.jpg'
      ]),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      room_number: '102',
      type: 'standard',
      price_per_night: 150.00,
      capacity_adults: 2,
      capacity_children: 1,
      size_sqm: 25,
      bed_type: 'double',
      status: 'available',
      floor: 1,
      description: 'Quarto padrão com vista para o jardim',
      amenities: JSON.stringify({
        wifi: true,
        tv: true,
        ar: true,
        frigobar: true,
        cofre: false
      }),
      images: JSON.stringify([
        '/images/rooms/standard/1.jpg',
        '/images/rooms/standard/2.jpg'
      ]),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      room_number: '201',
      type: 'deluxe',
      price_per_night: 250.00,
      capacity_adults: 2,
      capacity_children: 2,
      size_sqm: 35,
      bed_type: 'king',
      status: 'available',
      floor: 2,
      description: 'Quarto deluxe com cama king size e banheira',
      amenities: JSON.stringify({
        wifi: true,
        tv: true,
        ar: true,
        frigobar: true,
        cofre: true,
        banheira: true
      }),
      images: JSON.stringify([
        '/images/rooms/deluxe/1.jpg',
        '/images/rooms/deluxe/2.jpg'
      ]),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      room_number: '301',
      type: 'family',
      price_per_night: 350.00,
      capacity_adults: 4,
      capacity_children: 2,
      size_sqm: 50,
      bed_type: 'queen',
      status: 'available',
      floor: 3,
      description: 'Quarto familiar com duas camas queen e sala de estar',
      amenities: JSON.stringify({
        wifi: true,
        tv: true,
        ar: true,
        frigobar: true,
        cofre: true,
        sofa: true
      }),
      images: JSON.stringify([
        '/images/rooms/family/1.jpg',
        '/images/rooms/family/2.jpg'
      ]),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      room_number: '401',
      type: 'suite',
      price_per_night: 500.00,
      capacity_adults: 2,
      capacity_children: 2,
      size_sqm: 70,
      bed_type: 'king',
      status: 'available',
      floor: 4,
      description: 'Suíte master com sala separada e vista panorâmica',
      amenities: JSON.stringify({
        wifi: true,
        tv: true,
        ar: true,
        frigobar: true,
        cofre: true,
        banheira: true,
        varanda: true
      }),
      images: JSON.stringify([
        '/images/rooms/suite/1.jpg',
        '/images/rooms/suite/2.jpg'
      ]),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);
};