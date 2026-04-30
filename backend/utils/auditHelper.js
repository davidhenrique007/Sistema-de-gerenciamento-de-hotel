// Função auxiliar para registrar logs
const registrarLog = async (userId, userName, userRole, acao, entidade, entidadeId, ip, detalhes = {}, status = 'SUCCESS') => {
  const pool = require('../config/database');
  try {
    await pool.query(`
      INSERT INTO audit_logs (user_id, user_name, user_role, acao, entidade, entidade_id, ip, detalhes, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    `, [userId, userName, userRole, acao, entidade, entidadeId, ip, JSON.stringify(detalhes), status]);
  } catch (error) {
    console.error('Erro ao registrar log:', error.message);
  }
};
