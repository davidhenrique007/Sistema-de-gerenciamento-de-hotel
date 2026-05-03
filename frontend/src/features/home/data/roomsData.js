/**
 * Dados mockados dos quartos - VERSÃO COM SUPORTE A i18n
 * 
 * As descrições agora usam KEYS de tradução em vez de texto fixo
 */

export const roomsData = [
  {
    id: '1b24f268-a857-4428-a720-43997c223975',
    number: '01',
    type: 'standard',
    typeLabelKey: 'rooms.types.standard',
    capacity: 2,
    price: {
      amount: 3000,
      currency: 'MZN',
    },
    status: 'available',
    amenitiesKeys: ['rooms.amenities.wifi', 'rooms.amenities.tv', 'rooms.amenities.ac', 'rooms.amenities.minibar'],
    images: {
      main: '/assets/images/rooms/standard/main.jpg',
      gallery: [
        '/assets/images/rooms/standard/1.jpg',
        '/assets/images/rooms/standard/2.jpg',
        '/assets/images/rooms/standard/3.jpg',
      ]
    },
    descriptionKey: 'rooms.descriptions.cozy_garden',
    bedTypeKey: 'rooms.beds.queen',
    size: 25,
    floor: 1,
  },
  {
    id: '66f3cd77-86ec-4951-8dbe-e6bb98943080',
    number: '15',
    type: 'deluxe',
    typeLabelKey: 'rooms.types.deluxe',
    capacity: 3,
    price: {
      amount: 4000,
      currency: 'MZN',
    },
    status: 'available',
    amenitiesKeys: ['rooms.amenities.wifi', 'rooms.amenities.tv', 'rooms.amenities.ac', 'rooms.amenities.minibar', 'rooms.amenities.safe', 'rooms.amenities.balcony'],
    images: {
      main: '/assets/images/rooms/deluxe/main.jpg',
      gallery: [
        '/assets/images/rooms/deluxe/1.jpg',
        '/assets/images/rooms/deluxe/2.jpg',
        '/assets/images/rooms/deluxe/3.jpg',
      ]
    },
    descriptionKey: 'rooms.descriptions.spacious_balcony',
    bedTypeKey: 'rooms.beds.mixed',
    size: 35,
    floor: 2,
  },
  {
    id: '29ee2d94-1cbd-4d85-acb7-ad24819011f2',
    number: '25',
    type: 'deluxe',
    typeLabelKey: 'rooms.types.deluxe',
    capacity: 3,
    price: {
      amount: 4000,
      currency: 'MZN',
    },
    status: 'available',
    amenitiesKeys: ['rooms.amenities.wifi', 'rooms.amenities.tv', 'rooms.amenities.ac', 'rooms.amenities.minibar', 'rooms.amenities.safe', 'rooms.amenities.balcony'],
    images: {
      main: '/assets/images/rooms/deluxe/main.jpg',
      gallery: [
        '/assets/images/rooms/deluxe/1.jpg',
        '/assets/images/rooms/deluxe/2.jpg',
        '/assets/images/rooms/deluxe/3.jpg',
      ]
    },
    descriptionKey: 'rooms.descriptions.deluxe_panoramic',
    bedTypeKey: 'rooms.beds.three_single',
    size: 35,
    floor: 2,
  },
  {
    id: '07b0b4fb-2dca-4931-8620-71e955aa4f15',
    number: '35',
    type: 'executive',
    typeLabelKey: 'rooms.types.executive',
    capacity: 4,
    price: {
      amount: 5000,
      currency: 'MZN',
    },
    status: 'available',
    amenitiesKeys: ['rooms.amenities.wifi', 'rooms.amenities.tv', 'rooms.amenities.ac', 'rooms.amenities.minibar', 'rooms.amenities.safe', 'rooms.amenities.balcony', 'rooms.amenities.desk'],
    images: {
      main: '/assets/images/rooms/executive/main.jpg',
      gallery: [
        '/assets/images/rooms/executive/1.jpg',
        '/assets/images/rooms/executive/2.jpg',
        '/assets/images/rooms/executive/3.jpg',
      ]
    },
    descriptionKey: 'rooms.descriptions.executive',
    bedTypeKey: 'rooms.beds.two_queen',
    size: 45,
    floor: 3,
  },
  {
    id: '8b925b7a-0909-4014-aea7-474f29b28cbb',
    number: '40',
    type: 'family',
    typeLabelKey: 'rooms.types.family',
    capacity: 5,
    price: {
      amount: 7000,
      currency: 'MZN',
    },
    status: 'available',
    amenitiesKeys: ['rooms.amenities.wifi', 'rooms.amenities.tv', 'rooms.amenities.ac', 'rooms.amenities.minibar', 'rooms.amenities.safe', 'rooms.amenities.balcony', 'rooms.amenities.sea_view', 'rooms.amenities.bathtub'],
    images: {
      main: '/assets/images/rooms/family/main.jpg',
      gallery: [
        '/assets/images/rooms/family/1.jpg',
        '/assets/images/rooms/family/2.jpg',
        '/assets/images/rooms/family/3.jpg',
      ]
    },
    descriptionKey: 'rooms.descriptions.family',
    bedTypeKey: 'rooms.beds.family',
    size: 60,
    floor: 4,
  },
  {
    id: 'dc91df40-abb1-48d2-b74f-4961e78dabc6',
    number: '43',
    type: 'presidential',
    typeLabelKey: 'rooms.types.presidential',
    capacity: 6,
    price: {
      amount: 12000,
      currency: 'MZN',
    },
    status: 'available',
    amenitiesKeys: ['rooms.amenities.wifi', 'rooms.amenities.tv', 'rooms.amenities.ac', 'rooms.amenities.minibar', 'rooms.amenities.safe', 'rooms.amenities.balcony', 'rooms.amenities.sea_view', 'rooms.amenities.jacuzzi', 'rooms.amenities.living_room'],
    images: {
      main: '/assets/images/rooms/presidential/main.jpg',
      gallery: [
        '/assets/images/rooms/presidential/1.jpg',
        '/assets/images/rooms/presidential/2.jpg',
        '/assets/images/rooms/presidential/3.jpg',
      ]
    },
    descriptionKey: 'rooms.descriptions.presidential',
    bedTypeKey: 'rooms.beds.presidential',
    size: 100,
    floor: 5,
  },
];

export const getRooms = () => roomsData;

export const getRoomById = (id) => roomsData.find(room => room.id === id);

export default roomsData;
