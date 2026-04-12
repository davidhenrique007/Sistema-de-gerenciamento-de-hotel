// backend/models/LogAuditoria.js
const db = require('../config/database');

class LogAuditoria {
  static async registrar({
    usuarioId,
    usuarioNome,
    usuarioRole,
    acao,
    reservaId,
    dadosAntigos = null,
    dadosNovos = null,
    motivo = null,
    ip = null
  }) {
    try {
      const query = `
        INSERT INTO logs_auditoria (
          usuario_id,
          usuario_nome,
          usuario_role,
          acao,
          reserva_id,
          dados_antigos,
          dados_novos,
          motivo,
          ip,
          data_hora
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING id
      `;

      const params = [
        usuarioId,
        usuarioNome,
        usuarioRole,
        acao,
        reservaId,
        dadosAntigos ? JSON.stringify(dadosAntigos) : null,
        dadosNovos ? JSON.stringify(dadosNovos) : null,
        motivo,
        ip
      ];

      const result = await db.query(query, params);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Erro ao registrar log de auditoria:', error);
      throw error;
    }
  }

  static async listarPorReserva(reservaId, limit = 50) {
    try {
      const query = `
        SELECT * FROM logs_auditoria
        WHERE reserva_id = $1
        ORDER BY data_hora DESC
        LIMIT $2
      `;
      const result = await db.query(query, [reservaId, limit]);
      return result.rows;
    } catch (error) {
      console.error('❌ Erro ao listar logs:', error);
      return [];
    }
  }

  static async listarPorUsuario(usuarioId, limit = 100) {
    try {
      const query = `
        SELECT * FROM logs_auditoria
        WHERE usuario_id = $1
        ORDER BY data_hora DESC
        LIMIT $2
      `;
      const result = await db.query(query, [usuarioId, limit]);
      return result.rows;
    } catch (error) {
      console.error('❌ Erro ao listar logs:', error);
      return [];
    }
  }
}

module.exports = LogAuditoria;