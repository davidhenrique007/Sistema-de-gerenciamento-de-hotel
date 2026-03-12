// =====================================================
// HOTEL PARADISE - SETUP PARA TESTES
// =====================================================

process.env.NODE_ENV = 'test';
process.env.PORT = 5001; // Porta diferente para não conflitar

// Configurar variáveis de ambiente para testes
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = 5432;
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.DB_NAME = 'hotel_paradise_test';

// Mock do console para não poluir os testes
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Aumentar timeout
jest.setTimeout(30000);