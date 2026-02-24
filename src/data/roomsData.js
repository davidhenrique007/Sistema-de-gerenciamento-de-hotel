// ============================================
// DATA: roomsData.js
// ============================================
// Dados mock para inicialização do repositório
// Versão corrigida - EXATAMENTE 6 QUARTOS
// Deluxe: 2 quartos | Outros: 1 cada
// ============================================

export const roomsData = [
  // STANDARD - 1 quarto
  {
    id: 101,
    number: '101',
    type: 'standard',
    typeLabel: 'Standard',
    capacity: 2,
    pricePerNight: {
      amount: 3000.00,  // 3.000 MZN
      currency: 'MZN'
    },
    status: 'AVAILABLE',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar']
  },
  
  // DELUXE - 2 quartos
  {
    id: 102,
    number: '102',
    type: 'deluxe',
    typeLabel: 'Deluxe',
    capacity: 3,
    pricePerNight: {
      amount: 4000.00,  // 4.000 MZN
      currency: 'MZN'
    },
    status: 'AVAILABLE',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Banheira', 'Vista mar']
  },
  {
    id: 103,
    number: '103',
    type: 'deluxe',
    typeLabel: 'Deluxe',
    capacity: 3,
    pricePerNight: {
      amount: 4500.00,  // 4.500 MZN
      currency: 'MZN'
    },
    status: 'AVAILABLE',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Vista mar', 'Cafeteira']
  },
  
  // EXECUTIVO - 1 quarto
  {
    id: 201,
    number: '201',
    type: 'executive',
    typeLabel: 'Executivo',
    capacity: 2,
    pricePerNight: {
      amount: 5000.00,  // 5.000 MZN
      currency: 'MZN'
    },
    status: 'AVAILABLE',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Mesa de trabalho', 'Cafeteira', 'Secador']
  },
  
  // FAMÍLIA - 1 quarto
  {
    id: 301,
    number: '301',
    type: 'family',
    typeLabel: 'Família',
    capacity: 5,
    pricePerNight: {
      amount: 7000.00,  // 7.000 MZN
      currency: 'MZN'
    },
    status: 'AVAILABLE',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', '2 camas', 'Berço', 'Sofá-cama']
  },
  
  // PRESIDENCIAL - 1 quarto
  {
    id: 401,
    number: '401',
    type: 'presidential',
    typeLabel: 'Presidencial',
    capacity: 4,
    pricePerNight: {
      amount: 12000.00,  // 12.000 MZN
      currency: 'MZN'
    },
    status: 'AVAILABLE',
    amenities: [
      'Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Sala', 'Jacuzzi', 
      'Vista 360', 'Cafeteira', 'Secador', 'Cofre', 'Varanda'
    ]
  }
];