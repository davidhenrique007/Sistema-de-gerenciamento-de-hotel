// =====================================================
// SERVIÇO CENTRAL DE AUDITORIA - HOTEL PARADISE
// =====================================================

const db = require('../config/database');
const config = require('../config/audit.config');

class AuditService {
  constructor() {
    this.batchQueue = [];
    this.isProcessing = false;
    
    // Processar batch a cada intervalo
    setInterval(() => this.processBatch(), config.batchInterval);
  }

  // Método principal para registrar log
  async log(data) {
    const logEntry = {
      userId: data.userId || null,
      userName: data.userName || null,
      userRole: data.userRole || null,
      acao: data.acao,
      entidade: data.entidade,
      entidadeId: data.entidadeId || null,
      ip: data.ip || null,
      userAgent: data.userAgent || null,
      status: data.status || 'SUCCESS',
      detalhes: this.sanitizeData(data.detalhes || {}),
      nivel: data.nivel || 'INFO',
      createdAt: new Date().toISOString()
    };

    // Adicionar à fila batch
    this.batchQueue.push(logEntry);

    // Se batch atingiu tamanho máximo, processar imediatamente
    if (this.batchQueue.length >= config.batchSize) {
      await this.processBatch();
    }

    return logEntry;
  }

  // Processar batch de logs
  async processBatch() {
    if (this.isProcessing || this.batchQueue.length === 0) return;

    this.isProcessing = true;
    const batch = [...this.batchQueue];
    this.batchQueue = [];

    try {
      const values = batch.map(log => 
        `(${log.userId ? `'${log.userId}'` : 'NULL'}, 
          ${log.userName ? `'${log.userName}'` : 'NULL'},
          ${log.userRole ? `'${log.userRole}'` : 'NULL'},
          '${log.acao}',
          '${log.entidade}',
          ${log.entidadeId ? `'${log.entidadeId}'` : 'NULL'},
          ${log.ip ? `'${log.ip}'` : 'NULL'},
          ${log.userAgent ? `'${log.userAgent.replace(/'/g, "''")}'` : 'NULL'},
          '${log.status}',
          '${JSON.stringify(log.detalhes).replace(/'/g, "''")}',
          '${log.nivel}',
          '${log.createdAt}')`
      ).join(',');

      await db.query(`
        INSERT INTO audit_logs 
        (user_id, user_name, user_role, acao, entidade, entidade_id, 
         ip, user_agent, status, detalhes, nivel, created_at)
        VALUES ${values}
      `);
    } catch (error) {
      console.error('❌ Erro ao salvar batch de auditoria:', error.message);
      // Recolocar logs na fila em caso de erro
      this.batchQueue.unshift(...batch);
    } finally {
      this.isProcessing = false;
    }
  }

  // Buscar logs com filtros
  async getLogs(filters = {}) {
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

    if (filters.entidade) {
      conditions.push(`entidade = $${paramIndex++}`);
      params.push(filters.entidade);
    }

    if (filters.startDate) {
      conditions.push(`created_at >= $${paramIndex++}`);
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      conditions.push(`created_at <= $${paramIndex++}`);
      params.push(filters.endDate);
    }

    if (filters.status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(filters.status);
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
    
    // Total de registros
    const countQuery = `
      SELECT COUNT(*) as total FROM audit_logs ${whereClause}
    `;
    const countResult = await db.query(countQuery, params.slice(0, -2));

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset
    };
  }

  // Remover logs antigos
  async cleanupOldLogs() {
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - config.retentionDays);

    const result = await db.query(`
      DELETE FROM audit_logs 
      WHERE created_at < $1
      RETURNING id
    `, [retentionDate]);

    console.log(`🧹 ${result.rowCount} logs antigos removidos`);
    return result.rowCount;
  }

  // Mascarar dados sensíveis
  sanitizeData(data) {
    if (!data || typeof data !== 'object') return data;

    const sanitized = { ...data };
    
    for (const field of config.sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  // Registrar ação específica
  async logAction(user, action, entity, entityId, details = {}, status = 'SUCCESS') {
    return this.log({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      acao: action,
      entidade: entity,
      entidadeId: entityId,
      detalhes: details,
      status
    });
  }
}

module.exports = new AuditService();