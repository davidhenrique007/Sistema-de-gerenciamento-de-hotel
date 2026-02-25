// ============================================
// DATA: roomsData.js
// ============================================
// Dados mock para inicialização do repositório
// IDs sequenciais de 1 a 6
// ============================================

export const roomsData = [
  // 1. STANDARD - ID 1
  {
    id: 1,
    number: '01',
    type: 'standard',
    typeLabel: 'Standard',
    capacity: 2,
    pricePerNight: {
      amount: 3000.00,
      currency: 'MZN'
    },
    status: 'AVAILABLE',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar']
  },
  
  // 2. DELUXE 1 - ID 2
  {
    id: 2,
    number: '10',
    type: 'deluxe',
    typeLabel: 'Deluxe',
    capacity: 3,
    pricePerNight: {
      amount: 4000.00,
      currency: 'MZN'
    },
    status: 'AVAILABLE',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Banheira', 'Vista mar']
  },
  
  // 3. DELUXE 2 - ID 3
  {
    id: 3,
    number: '20',
    type: 'deluxe',
    typeLabel: 'Deluxe',
    capacity: 3,
    pricePerNight: {
      amount: 4500.00,
      currency: 'MZN'
    },
    status: 'AVAILABLE',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Vista mar', 'Cafeteira']
  },
  
  // 4. EXECUTIVO - ID 4
  {
    id: 4,
    number: '25',
    type: 'executive',
    typeLabel: 'Executivo',
    capacity: 2,
    pricePerNight: {
      amount: 5000.00,
      currency: 'MZN'
    },
    status: 'AVAILABLE',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Mesa de trabalho', 'Cafeteira', 'Secador']
  },
  
  // 5. FAMÍLIA - ID 5
  {
    id: 5,
    number: '30',
    type: 'family',
    typeLabel: 'Família',
    capacity: 5,
    pricePerNight: {
      amount: 7000.00,
      currency: 'MZN'
    },
    status: 'AVAILABLE',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', '2 camas', 'Berço', 'Sofá-cama']
  },
  
  // 6. PRESIDENCIAL - ID 6
  {
    id: 6,
    number: '35',
    type: 'presidential',
    typeLabel: 'Presidencial',
    capacity: 4,
    pricePerNight: {
      amount: 12000.00,
      currency: 'MZN'
    },
    status: 'AVAILABLE',
    amenities: [
      'Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Sala', 'Jacuzzi', 
      'Vista 360', 'Cafeteira', 'Secador', 'Cofre', 'Varanda'
    ]
  }
];