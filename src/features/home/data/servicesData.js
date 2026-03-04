/**
 * Dados mockados dos serviços do hotel
 * 
 * Estrutura preparada para futura integração com API REST
 * Todos os IDs são strings para compatibilidade com bancos de dados reais
 */

export const servicesData = [
  {
    id: 'service-001',
    name: 'Café da manhã',
    description: 'Café da manhã completo com opções regionais, frutas frescas, pães artesanais e bebidas quentes.',
    icon: '☕',
    price: 350,
    priceFormatted: '350 MT',
    category: 'food',
    type: 'daily', // por diária
    highlights: ['Buffet livre', 'Comida regional', 'Opções fitness'],
  },
  {
    id: 'service-002',
    name: 'Spa & Bem-estar',
    description: 'Sessão de massagem relaxante com óleos essenciais em ambiente exclusivo.',
    icon: '💆',
    price: 1200,
    priceFormatted: '1.200 MT',
    category: 'wellness',
    type: 'stay', // por estadia
    duration: '60 min',
    highlights: ['Massagem relaxante', 'Óleos essenciais', 'Ambiente calmo'],
  },
  {
    id: 'service-003',
    name: 'Piscina aquecida',
    description: 'Acesso à piscina aquecida com vista para o mar e área de lounges.',
    icon: '🏊',
    price: 200,
    priceFormatted: '200 MT',
    category: 'leisure',
    type: 'daily',
    highlights: ['Vista para o mar', 'Toalhas inclusas', 'Guarda-sol'],
  },
  {
    id: 'service-004',
    name: 'Academia',
    description: 'Academia moderna com equipamentos de última geração e instrutores.',
    icon: '💪',
    price: 150,
    priceFormatted: '150 MT',
    category: 'wellness',
    type: 'daily',
    highlights: ['Equipamentos modernos', 'Instrutor disponível', 'Água e toalhas'],
  },
  {
    id: 'service-005',
    name: 'Passeio de barco',
    description: 'Passeio de barco pelas ilhas da região com guia especializado.',
    icon: '⛵',
    price: 2500,
    priceFormatted: '2.500 MT',
    category: 'activity',
    type: 'stay',
    duration: '4 horas',
    highlights: ['Guia especializado', 'Snacks inclusos', 'Paradas para fotos'],
  },
  {
    id: 'service-006',
    name: 'Jantar romântico',
    description: 'Jantar especial à luz de velas com menu degustação e garrafa de vinho.',
    icon: '🍷',
    price: 1800,
    priceFormatted: '1.800 MT',
    category: 'food',
    type: 'stay',
    highlights: ['Menu degustação', 'Vinho incluso', 'Música ao vivo'],
  },
  {
    id: 'service-007',
    name: 'Estacionamento',
    description: 'Vaga coberta com segurança 24h e manobrista disponível.',
    icon: '🅿️',
    price: 200,
    priceFormatted: '200 MT',
    category: 'convenience',
    type: 'daily',
    highlights: ['Coberto', 'Segurança 24h', 'Manobrista'],
  },
  {
    id: 'service-008',
    name: 'Transfer aeroporto',
    description: 'Transfer exclusivo do aeroporto para o hotel em veículos de luxo.',
    icon: '🚗',
    price: 800,
    priceFormatted: '800 MT',
    category: 'convenience',
    type: 'stay',
    highlights: ['Veículo de luxo', 'Motorista bilíngue', 'Água e revistas'],
  },
];

/**
 * Categorias de serviços
 */
export const serviceCategories = [
  { id: 'all', label: 'Todos' },
  { id: 'food', label: 'Alimentação' },
  { id: 'wellness', label: 'Bem-estar' },
  { id: 'leisure', label: 'Lazer' },
  { id: 'activity', label: 'Atividades' },
  { id: 'convenience', label: 'Conveniência' },
];

/**
 * Funções utilitárias
 */
export const getServiceById = (id) => {
  return servicesData.find(service => service.id === id);
};

export const getServicesByCategory = (category) => {
  if (category === 'all' || !category) return servicesData;
  return servicesData.filter(service => service.category === category);
};

export default servicesData;