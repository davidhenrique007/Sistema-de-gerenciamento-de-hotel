// AuditService temporariamente desativado
const auditService = {
  log: async () => { return { success: true }; },
  getLogs: async () => { return { data: [], total: 0 }; },
  processBatch: async () => {},
  cleanupOldLogs: async () => { return 0; },
  sanitizeData: (data) => data
};

module.exports = auditService;
