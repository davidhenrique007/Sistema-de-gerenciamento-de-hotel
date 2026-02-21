// ============================================
// DATA: roomsData.js
// ============================================
// Dados mock para inicialização do repositório
// ============================================

export const roomsData = [
  {
    id: 101,
    number: '101',
    type: 'standard',
    capacity: 2,
    pricePerNight: {
      amount: 250.00,
      currency: 'BRL'
    },
    status: 'AVAILABLE',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar']
  },
  {
    id: 102,
    number: '102',
    type: 'standard',
    capacity: 2,
    pricePerNight: {
      amount: 280.00,
      currency: 'BRL'
    },
    status: 'AVAILABLE',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Vista mar']
  },
  {
    id: 103,
    number: '103',
    type: 'standard',
    capacity: 2,
    pricePerNight: {
      amount: 260.00,
      currency: 'BRL'
    },
    status: 'MAINTENANCE',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado']
  },
  {
    id: 201,
    number: '201',
    type: 'deluxe',
    capacity: 3,
    pricePerNight: {
      amount: 450.00,
      currency: 'BRL'
    },
    status: 'AVAILABLE',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Banheira', 'Vista mar']
  },
  {
    id: 202,
    number: '202',
    type: 'deluxe',
    capacity: 3,
    pricePerNight: {
      amount: 480.00,
      currency: 'BRL'
    },
    status: 'OCCUPIED',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Banheira']
  },
  {
    id: 203,
    number: '203',
    type: 'deluxe',
    capacity: 3,
    pricePerNight: {
      amount: 470.00,
      currency: 'BRL'
    },
    status: 'AVAILABLE',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Vista mar']
  },
  {
    id: 301,
    number: '301',
    type: 'executive',
    capacity: 2,
    pricePerNight: {
      amount: 600.00,
      currency: 'BRL'
    },
    status: 'AVAILABLE',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Mesa de trabalho', 'Cafeteira']
  },
  {
    id: 302,
    number: '302',
    type: 'executive',
    capacity: 2,
    pricePerNight: {
      amount: 650.00,
      currency: 'BRL'
    },
    status: 'RESERVED',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Mesa de trabalho', 'Vista panorâmica']
  },
  {
    id: 401,
    number: '401',
    type: 'family',
    capacity: 5,
    pricePerNight: {
      amount: 800.00,
      currency: 'BRL'
    },
    status: 'AVAILABLE',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', '2 camas', 'Berço']
  },
  {
    id: 402,
    number: '402',
    type: 'family',
    capacity: 4,
    pricePerNight: {
      amount: 750.00,
      currency: 'BRL'
    },
    status: 'CLEANING',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Sofá-cama']
  },
  {
    id: 501,
    number: '501',
    type: 'presidential',
    capacity: 4,
    pricePerNight: {
      amount: 1200.00,
      currency: 'BRL'
    },
    status: 'AVAILABLE',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Sala', 'Jacuzzi', 'Vista 360']
  }
];