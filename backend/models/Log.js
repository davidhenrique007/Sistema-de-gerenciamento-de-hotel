const db = require('../config/database');

class Log {
  static async registrar({
    usuarioId,
    usuarioNome,
    usuarioRole,
    acao,
    recurso = null,
    recursoId = null,
    dadosAntigos = null,
    dadosNovos = null,
    motivo = null,
    ip = null,
    userAgent = null,
    sucesso = true,
    mensagemErro = null
  }) {
    try {
      const query = `
        INSERT INTO logs_sistema (
          usuario_id,
          usuario_nome,
          usuario_role,
          acao,
          recurso,
          recurso_id,
          dados_antigos,
          dados_novos,
          motivo,
          ip,
          user_agent,
          sucesso,
          mensagem_erro,
          data_hora
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
        RETURNING id
      `;

      const params = [
        usuarioId,
        usuarioNome,
        usuarioRole,
        acao,
        recurso,
        recursoId,
        dadosAntigos ? JSON.stringify(dadosAntigos) : null,
        dadosNovos ? JSON.stringify(dadosNovos) : null,
        motivo,
        ip,
        userAgent,
        sucesso,
        mensagemErro
      ];

      const result = await db.query(query, params);
      console.log(`📝 Log registrado: ${acao} - ${usuarioNome}`);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Erro ao registrar log:', error.message);
      return null;
    }
  }

  static async listar(filtros = {}, limit = 100, offset = 0) {
    try {
      let query = `
        SELECT * FROM logs_sistema
        WHERE 1=1
      `;
      const params = [];
      let paramIndex = 1;

      if (filtros.usuarioId) {
        query += ` AND usuario_id = $${paramIndex++}`;
        params.push(filtros.usuarioId);
      }
      if (filtros.acao) {
        query += ` AND acao = $${paramIndex++}`;
        params.push(filtros.acao);
      }
      if (filtros.dataInicio) {
        query += ` AND data_hora >= $${paramIndex++}`;
        params.push(filtros.dataInicio);
      }
      if (filtros.dataFim) {
        query += ` AND data_hora <= $${paramIndex++}`;
        params.push(filtros.dataFim);
      }

      query += ` ORDER BY data_hora DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('❌ Erro ao listar logs:', error);
      return [];
    }
  }
}

module.exports = Log;
