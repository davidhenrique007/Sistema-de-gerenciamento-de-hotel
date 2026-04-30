// Função simples de log que não usa audit_logs
const simpleLog = (message, data = {}) => {
  console.log(`[LOG] ${message}`, data);
};

module.exports = { simpleLog };
