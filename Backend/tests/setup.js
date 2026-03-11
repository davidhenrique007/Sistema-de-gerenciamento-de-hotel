// =====================================================
// HOTEL PARADISE - TEST SETUP
// =====================================================

// Mock do Knex para testes
jest.mock('knex', () => {
  return jest.fn().mockReturnValue({
    raw: jest.fn().mockResolvedValue({ rows: [{ test: 1 }] }),
    destroy: jest.fn().mockResolvedValue()
  });
});

process.env.NODE_ENV = 'test';
