#!/usr/bin/env node

// =====================================================
// LIMPEZA AUTOMÁTICA DE LOGS - HOTEL PARADISE
// =====================================================

require('dotenv').config();
const { Pool } = require('pg');
const config = require('../config/audit.config');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function cleanupLogs() {
  console.log('🧹 Iniciando limpeza de logs antigos...');
  console.log(`📅 Retenção configurada: ${config.retentionDays} dias`);

  const retentionDate = new Date();
  retentionDate.setDate(retentionDate.getDate() - config.retentionDays);

  try {
    // Contar logs a serem removidos
    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM audit_logs WHERE created_at < $1',
      [retentionDate]
    );
    const totalToDelete = parseInt(countResult.rows[0].total);

    if (totalToDelete === 0) {
      console.log('✅ Nenhum log antigo para remover');
      return;
    }

    console.log(`📊 Encontrados ${totalToDelete} logs antigos`);

    // Remover em lotes para não sobrecarregar
    const batchSize = 1000;
    let totalDeleted = 0;

    while (true) {
      const result = await pool.query(`
        DELETE FROM audit_logs 
        WHERE created_at < $1 
        LIMIT $2
        RETURNING id
      `, [retentionDate, batchSize]);

      const deleted = result.rowCount;
      totalDeleted += deleted;

      console.log(`🗑️ Removidos ${deleted} logs (${totalDeleted}/${totalToDelete})`);

      if (deleted < batchSize) break;
    }

    console.log(`✅ Limpeza concluída! ${totalDeleted} logs removidos`);
    
    // Registrar a limpeza
    await pool.query(`
      INSERT INTO audit_logs (user_name, acao, entidade, detalhes, created_at)
      VALUES ('Sistema', 'CLEANUP_LOGS', 'Auditoria', $1, NOW())
    `, [JSON.stringify({ removidos: totalDeleted, retencaoDias: config.retentionDays })]);

  } catch (error) {
    console.error('❌ Erro na limpeza de logs:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Executar
cleanupLogs();