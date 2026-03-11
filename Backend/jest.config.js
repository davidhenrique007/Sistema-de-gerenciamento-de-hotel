// =====================================================
// HOTEL PARADISE - JEST CONFIGURATION
// Versão: 1.0.0
// =====================================================

module.exports = {
  // Ambiente de teste
  testEnvironment: 'node',
  
  // Diretórios onde os testes estão localizados
  roots: ['<rootDir>/tests'],
  
  // Padrão de arquivos de teste
  testMatch: [
    '**/tests/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Arquivos para ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  
  // Cobertura de código
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'services/**/*.js',
    'middlewares/**/*.js',
    'routes/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/tests/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Relatórios de cobertura
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Setup antes dos testes
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Verbosidade
  verbose: true,
  
  // Timeout (10 segundos)
  testTimeout: 10000
};