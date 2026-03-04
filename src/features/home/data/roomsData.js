/**
 * Dados mockados dos quartos
 * 
 * Esta estrutura segue o padrão que seria recebido de uma API REST
 * Todos os IDs são strings para compatibilidade com bancos de dados reais
 */

export const roomsData = [
  {
    id: 'room-001',
    number: '101',
    type: 'standard',
    capacity: 2,
    price: {
      amount: 3000,
      currency: 'MZN',
    },
    status: 'available',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar'],
    image: '/assets/images/rooms/standard/101.jpg',
    description: 'Quarto aconchegante com vista para o jardim, ideal para casais.',
    bedType: 'Cama de casal queen',
    size: 25,
    floor: 1,
  },
  {
    id: 'room-002',
    number: '102',
    type: 'standard',
    capacity: 2,
    price: {
      amount: 3000,
      currency: 'MZN',
    },
    status: 'available',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar'],
    image: '/assets/images/rooms/standard/102.jpg',
    description: 'Quarto aconchegante com varanda e vista parcial para o mar.',
    bedType: 'Cama de casal queen',
    size: 25,
    floor: 1,
  },
  {
    id: 'room-003',
    number: '201',
    type: 'deluxe',
    capacity: 3,
    price: {
      amount: 4000,
      currency: 'MZN',
    },
    status: 'available',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Cofre', 'Varanda'],
    image: '/assets/images/rooms/deluxe/201.jpg',
    description: 'Quarto espaçoso com varanda privativa e amenities premium.',
    bedType: '2 camas de solteiro + 1 cama de casal',
    size: 35,
    floor: 2,
  },
  {
    id: 'room-004',
    number: '202',
    type: 'deluxe',
    capacity: 3,
    price: {
      amount: 4000,
      currency: 'MZN',
    },
    status: 'occupied',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Cofre', 'Varanda'],
    image: '/assets/images/rooms/deluxe/202.jpg',
    description: 'Quarto deluxe com vista panorâmica e acabamentos de luxo.',
    bedType: '3 camas de solteiro',
    size: 35,
    floor: 2,
  },
  {
    id: 'room-005',
    number: '301',
    type: 'executive',
    capacity: 4,
    price: {
      amount: 5000,
      currency: 'MZN',
    },
    status: 'available',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Cofre', 'Varanda', 'Mesa de trabalho'],
    image: '/assets/images/rooms/executive/301.jpg',
    description: 'Quarto executivo com área de trabalho e amenities VIP.',
    bedType: '2 camas de casal',
    size: 45,
    floor: 3,
  },
  {
    id: 'room-006',
    number: '302',
    type: 'executive',
    capacity: 4,
    price: {
      amount: 5000,
      currency: 'MZN',
    },
    status: 'maintenance',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Cofre', 'Varanda', 'Mesa de trabalho'],
    image: '/assets/images/rooms/executive/302.jpg',
    description: 'Quarto executivo com sala de estar separada.',
    bedType: '2 camas de casal',
    size: 45,
    floor: 3,
  },
  {
    id: 'room-007',
    number: '401',
    type: 'family',
    capacity: 5,
    price: {
      amount: 7000,
      currency: 'MZN',
    },
    status: 'available',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Cofre', 'Varanda', 'Vista mar', 'Banheira'],
    image: '/assets/images/rooms/family/401.jpg',
    description: 'Quarto familiar com espaço para todos, perfeito para férias em família.',
    bedType: '2 camas de casal + 1 cama de solteiro',
    size: 60,
    floor: 4,
  },
  {
    id: 'room-008',
    number: '501',
    type: 'presidential',
    capacity: 6,
    price: {
      amount: 12000,
      currency: 'MZN',
    },
    status: 'available',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Cofre', 'Varanda', 'Vista mar', 'Jacuzzi', 'Sala de estar'],
    image: '/assets/images/rooms/presidential/501.jpg',
    description: 'A suíte presidencial oferece o máximo em luxo e conforto, com acabamentos premium e vista 360°.',
    bedType: '2 camas de casal king + sala de estar',
    size: 100,
    floor: 5,
  },
];

export const getRooms = () => roomsData;

export const getRoomById = (id) => roomsData.find(room => room.id === id);

export default roomsData;