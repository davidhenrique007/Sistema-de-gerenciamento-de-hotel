// =====================================================
// CONFIGURAÇÃO DE AUDITORIA - HOTEL PARADISE
// =====================================================

module.exports = {
  // Retenção de logs (dias)
  retentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS) || 90,

  // Níveis de log
  levels: {
    INFO: 'INFO',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
    CRITICAL: 'CRITICAL'
  },

  // Eventos auditáveis
  events: {
    // Autenticação
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    LOGOUT: 'LOGOUT',
    
    // Utilizadores
    USER_CREATED: 'USER_CREATED',
    USER_UPDATED: 'USER_UPDATED',
    USER_DELETED: 'USER_DELETED',
    
    // Reservas
    RESERVA_CREATED: 'RESERVA_CREATED',
    RESERVA_UPDATED: 'RESERVA_UPDATED',
    RESERVA_CANCELLED: 'RESERVA_CANCELLED',
    
    // Pagamentos
    PAYMENT_CREATED: 'PAYMENT_CREATED',
    PAYMENT_CONFIRMED: 'PAYMENT_CONFIRMED',
    
    // Quartos
    ROOM_CREATED: 'ROOM_CREATED',
    ROOM_UPDATED: 'ROOM_UPDATED',
    
    // Relatórios
    REPORT_GENERATED: 'REPORT_GENERATED',
    
    // Segurança
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    INVALID_TOKEN: 'INVALID_TOKEN'
  },

  // Rotas a ignorar (não geram logs)
  ignorePaths: [
    '/api/health',
    '/api/metrics',
    '/favicon.ico'
  ],

  // Mascarar dados sensíveis
  sensitiveFields: [
    'password',
    'token',
    'authorization',
    'cardNumber',
    'cvv'
  ],

  // Batch insert (logs por lote)
  batchSize: 50,
  batchInterval: 5000 // 5 segundos
};