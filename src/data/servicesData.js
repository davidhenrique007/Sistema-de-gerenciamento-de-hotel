// ============================================
// DATA: servicesData.js
// ============================================
// Dados mock para inicialização do repositório de serviços
// ============================================

export const servicesData = [
  {
    id: 1,
    name: 'Café da manhã',
    description: 'Café da manhã completo com opções variadas',
    price: {
      amount: 45.00,
      currency: 'BRL'
    },
    type: 'PER_PERSON_NIGHT',
    isOptional: true,
    maxQuantity: 2
  },
  {
    id: 2,
    name: 'Massagem relaxante',
    description: 'Massagem de 60 minutos',
    price: {
      amount: 150.00,
      currency: 'BRL'
    },
    type: 'PER_PERSON',
    isOptional: true,
    maxQuantity: 2
  },
  {
    id: 3,
    name: 'Estacionamento',
    description: 'Vaga coberta no estacionamento',
    price: {
      amount: 30.00,
      currency: 'BRL'
    },
    type: 'PER_NIGHT',
    isOptional: true,
    maxQuantity: 1
  },
  {
    id: 4,
    name: 'Jantar romântico',
    description: 'Jantar especial para duas pessoas',
    price: {
      amount: 280.00,
      currency: 'BRL'
    },
    type: 'PER_STAY',
    isOptional: true,
    maxQuantity: 1
  },
  {
    id: 5,
    name: 'Translado aeroporto',
    description: 'Transporte ida/volta',
    price: {
      amount: 120.00,
      currency: 'BRL'
    },
    type: 'PER_PERSON',
    isOptional: true,
    maxQuantity: 4
  },
  {
    id: 6,
    name: 'Acesso ao spa',
    description: 'Acesso completo ao spa por 1 dia',
    price: {
      amount: 90.00,
      currency: 'BRL'
    },
    type: 'PER_PERSON',
    isOptional: true,
    maxQuantity: 2
  },
  {
    id: 7,
    name: 'Cesta de frutas',
    description: 'Cesta de boas-vindas',
    price: {
      amount: 50.00,
      currency: 'BRL'
    },
    type: 'PER_STAY',
    isOptional: true,
    maxQuantity: 1
  },
  {
    id: 8,
    name: 'Wi-Fi Premium',
    description: 'Conexão de alta velocidade',
    price: {
      amount: 25.00,
      currency: 'BRL'
    },
    type: 'PER_NIGHT',
    isOptional: true,
    maxQuantity: 1
  },
  {
    id: 9,
    name: 'Room service 24h',
    description: 'Serviço de quarto disponível 24 horas',
    price: {
      amount: 0.00,
      currency: 'BRL'
    },
    type: 'PER_STAY',
    isOptional: false,
    maxQuantity: 1
  },
  {
    id: 10,
    name: 'Coquetel de boas-vindas',
    description: 'Coquetel exclusivo no check-in',
    price: {
      amount: 0.00,
      currency: 'BRL'
    },
    type: 'PER_STAY',
    isOptional: false,
    maxQuantity: 1
  }
];