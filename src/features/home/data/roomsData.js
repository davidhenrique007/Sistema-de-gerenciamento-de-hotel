/**
 * Dados mockados dos quartos - VERSÃO COM 6 QUARTOS
 * 
 * Distribuição:
 * - 2 quartos Deluxe
 * - 4 quartos de outros tipos (Standard, Executivo, Família, Presidencial)
 */

export const roomsData = [
  {
    id: 'room-001',
    number: '01',
    type: 'standard',
    typeLabel: 'Standard',
    capacity: 2,
    price: {
      amount: 3000,
      currency: 'MZN',
    },
    status: 'available',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar'],
    images: {
      main: '/assets/images/rooms/standard/main.jpg',
      gallery: [
        '/assets/images/rooms/standard/1.jpg',
        '/assets/images/rooms/standard/2.jpg',
        '/assets/images/rooms/standard/3.jpg',
      ]
    },
    description: 'Quarto aconchegante com vista para o jardim, ideal para casais.',
    bedType: 'Cama de casal queen',
    size: 25,
    floor: 1,
  },
  {
    id: 'room-002',
    number: '15',
    type: 'deluxe',
    typeLabel: 'Deluxe',
    capacity: 3,
    price: {
      amount: 4000,
      currency: 'MZN',
    },
    status: 'available',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Cofre', 'Varanda'],
    images: {
      main: '/assets/images/rooms/deluxe/main.jpg',
      gallery: [
        '/assets/images/rooms/deluxe/1.jpg',
        '/assets/images/rooms/deluxe/2.jpg',
        '/assets/images/rooms/deluxe/3.jpg',
      ]
    },
    description: 'Quarto espaçoso com varanda privativa e amenities premium.',
    bedType: '2 camas de solteiro + 1 cama de casal',
    size: 35,
    floor: 2,
  },
  {
    id: 'room-003',
    number: ' 25',
    type: 'deluxe',
    typeLabel: 'Deluxe',
    capacity: 3,
    price: {
      amount: 4000,
      currency: 'MZN',
    },
    status: 'available',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Cofre', 'Varanda'],
    images: {
      main: '/assets/images/rooms/deluxe/main.jpg',
      gallery: [
        '/assets/images/rooms/deluxe/1.jpg',
        '/assets/images/rooms/deluxe/2.jpg',
        '/assets/images/rooms/deluxe/3.jpg',
      ]
    },
    description: 'Quarto deluxe com vista panorâmica e acabamentos de luxo.',
    bedType: '3 camas de solteiro',
    size: 35,
    floor: 2,
  },
  {
    id: 'room-004',
    number: '35',
    type: 'executive',
    typeLabel: 'Executivo',
    capacity: 4,
    price: {
      amount: 5000,
      currency: 'MZN',
    },
    status: 'available',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Cofre', 'Varanda', 'Mesa de trabalho'],
    images: {
      main: '/assets/images/rooms/executive/main.jpg',
      gallery: [
        '/assets/images/rooms/executive/1.jpg',
        '/assets/images/rooms/executive/2.jpg',
        '/assets/images/rooms/executive/3.jpg',
      ]
    },
    description: 'Quarto executivo com área de trabalho e amenities VIP.',
    bedType: '2 camas de casal',
    size: 45,
    floor: 3,
  },
  {
    id: 'room-005',
    number: '40',
    type: 'family',
    typeLabel: 'Família',
    capacity: 5,
    price: {
      amount: 7000,
      currency: 'MZN',
    },
    status: 'available',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Cofre', 'Varanda', 'Vista mar', 'Banheira'],
    images: {
      main: '/assets/images/rooms/family/main.jpg',
      gallery: [
        '/assets/images/rooms/family/1.jpg',
        '/assets/images/rooms/family/2.jpg',
        '/assets/images/rooms/family/3.jpg',
      ]
    },
    description: 'Quarto familiar com espaço para todos, perfeito para férias em família.',
    bedType: '2 camas de casal + 1 cama de solteiro',
    size: 60,
    floor: 4,
  },
  {
    id: 'room-006',
    number: '43',
    type: 'presidential',
    typeLabel: 'Presidencial',
    capacity: 6,
    price: {
      amount: 12000,
      currency: 'MZN',
    },
    status: 'available',
    amenities: ['Wi-Fi', 'TV', 'Ar condicionado', 'Frigobar', 'Cofre', 'Varanda', 'Vista mar', 'Jacuzzi', 'Sala de estar'],
    images: {
      main: '/assets/images/rooms/presidential/main.jpg',
      gallery: [
        '/assets/images/rooms/presidential/1.jpg',
        '/assets/images/rooms/presidential/2.jpg',
        '/assets/images/rooms/presidential/3.jpg',
      ]
    },
    description: 'A suíte presidencial oferece o máximo em luxo e conforto.',
    bedType: '2 camas de casal king + sala de estar',
    size: 100,
    floor: 5,
  },
];

export const getRooms = () => roomsData;

export const getRoomById = (id) => roomsData.find(room => room.id === id);

export default roomsData;