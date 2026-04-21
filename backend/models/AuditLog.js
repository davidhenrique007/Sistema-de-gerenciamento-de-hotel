// =====================================================
// MODELO DE AUDITORIA - HOTEL PARADISE
// =====================================================

const db = require('../config/database');

class AuditLog {
  // Criar log
  static async create(data) {
    const query = `
      INSERT INTO audit_logs 
      (user_id, user_name, user_role, acao, entidade, entidade_id, 
       ip, user_agent, status, detalhes, nivel)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const result = await db.query(query, [
      data.userId,
      data.userName,
      data.userRole,
      data.acao,
      data.entidade,
      data.entidadeId,
      data.ip,
      data.userAgent,
      data.status || 'SUCCESS',
      JSON.stringify(data.detalhes || {}),
      data.nivel || 'INFO'
    ]);

    return result.rows[0];
  }

  // Buscar logs
  static async find(filters = {}) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (filters.userId) {
      conditions.push(`user_id = $${paramIndex++}`);
      params.push(filters.userId);
    }

    if (filters.acao) {
      conditions.push(`acao = $${paramIndex++}`);
      params.push(filters.acao);
    }

    if (filters.startDate) {
      conditions.push(`created_at >= $${paramIndex++}`);
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      conditions.push(`created_at <= $${paramIndex++}`);
      params.push(filters.endDate);
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : '';

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const query = `
      SELECT * FROM audit_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  // Buscar por ID
  static async findById(id) {
    const result = await db.query(
      'SELECT * FROM audit_logs WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Contar logs
  static async count(filters = {}) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (filters.userId) {
      conditions.push(`user_id = $${paramIndex++}`);
      params.push(filters.userId);
    }

    if (filters.acao) {
      conditions.push(`acao = $${paramIndex++}`);
      params.push(filters.acao);
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : '';

    const result = await db.query(
      `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`,
      params
    );
    
    return parseInt(result.rows[0].total);
  }

  // Remover logs antigos
  static async deleteOld(days) {
    const result = await db.query(`
      DELETE FROM audit_logs 
      WHERE created_at < NOW() - INTERVAL '${days} days'
      RETURNING id
    `);
    
    return result.rowCount;
  }
}

module.exports = AuditLog;