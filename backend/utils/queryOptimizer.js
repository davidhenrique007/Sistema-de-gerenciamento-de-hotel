// backend/utils/queryOptimizer.js
class QueryOptimizer {
  constructor(db) {
    this.db = db;
  }

  async analyze(query, params = []) {
    const explainQuery = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`;
    
    try {
      const result = await this.db.query(explainQuery, params);
      const plan = result.rows[0]['QUERY PLAN'];
      
      return this.parsePlan(plan);
    } catch (error) {
      console.error('Analysis failed:', error);
      return null;
    }
  }

  parsePlan(plan) {
    const analysis = {
      executionTime: 0,
      planningTime: 0,
      sequentialScans: [],
      indexScans: [],
      cost: 0,
      rows: 0,
      suggestions: []
    };

    const extract = (node) => {
      if (node['Execution Time']) {
        analysis.executionTime = parseFloat(node['Execution Time']);
      }
      if (node['Planning Time']) {
        analysis.planningTime = parseFloat(node['Planning Time']);
      }
      if (node['Plan']) {
        analysis.cost = parseFloat(node['Plan']['Total Cost'] || 0);
        analysis.rows = parseInt(node['Plan']['Plan Rows'] || 0);
        
        if (node['Plan']['Node Type'] === 'Seq Scan') {
          analysis.sequentialScans.push({
            table: node['Plan']['Relation Name'],
            cost: node['Plan']['Total Cost']
          });
          analysis.suggestions.push(`⚠️ Sequential scan on ${node['Plan']['Relation Name']}. Consider adding index.`);
        }
        
        if (node['Plan']['Plans']) {
          node['Plan']['Plans'].forEach(extract);
        }
      }
    };

    extract(plan[0]);
    
    if (analysis.executionTime > 100) {
      analysis.suggestions.push(`⚠️ Query took ${analysis.executionTime.toFixed(2)}ms. Consider optimization.`);
    }
    
    return analysis;
  }

  suggestIndexes(table, columns) {
    const suggestions = [];
    
    for (const column of columns) {
      suggestions.push({
        table,
        column,
        sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_${table}_${column} ON ${table}(${column});`,
        reason: `Frequent filter on ${column} column`
      });
    }
    
    return suggestions;
  }

  async getOptimalIndexes() {
    const indexes = [];
    
    // Índices para reservas
    indexes.push({
      table: 'reservations',
      columns: ['check_in', 'check_out'],
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reservations_dates ON reservations(check_in, check_out);`,
      priority: 'high',
      reason: 'Frequent date range queries'
    });
    
    indexes.push({
      table: 'reservations',
      columns: ['status', 'payment_status'],
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reservations_status ON reservations(status, payment_status);`,
      priority: 'high',
      reason: 'Status filtering for dashboards'
    });
    
    // Índices para quartos
    indexes.push({
      table: 'rooms',
      columns: ['status', 'type'],
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rooms_status_type ON rooms(status, type);`,
      priority: 'medium',
      reason: 'Room availability queries'
    });
    
    // Índices para utilizadores
    indexes.push({
      table: 'users',
      columns: ['role', 'is_active'],
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_active ON users(role, is_active);`,
      priority: 'medium',
      reason: 'User filtering by role'
    });
    
    // Índices para logs
    indexes.push({
      table: 'logs_sistema',
      columns: ['acao', 'data_hora'],
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_logs_acao_data ON logs_sistema(acao, data_hora DESC);`,
      priority: 'medium',
      reason: 'Audit log queries'
    });
    
    // Índice composto para métricas dashboard
    indexes.push({
      table: 'reservations',
      columns: ['check_in', 'status', 'payment_status'],
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reservations_dashboard ON reservations(check_in, status, payment_status);`,
      priority: 'high',
      reason: 'Dashboard metrics queries'
    });
    
    return indexes;
  }

  async createIndexIfNotExists(indexSql) {
    try {
      await this.db.query(indexSql);
      console.log(`✅ Index created: ${indexSql.substring(0, 60)}...`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to create index:`, error.message);
      return false;
    }
  }
}

module.exports = QueryOptimizer;