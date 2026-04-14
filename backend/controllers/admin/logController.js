const db = require('../../config/database');

class LogController {
  async listar(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        acao,
        dataInicio,
        dataFim,
        usuarioId
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const params = [];
      let paramIndex = 1;
      const conditions = [];

      let query = `
        SELECT 
          id,
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
          sucesso,
          mensagem_erro,
          data_hora,
          TO_CHAR(data_hora, 'DD/MM/YYYY HH24:MI:SS') as data_hora_formatada
        FROM logs_sistema
        WHERE 1=1
      `;

      if (acao) {
        conditions.push(`acao = $${paramIndex}`);
        params.push(acao);
        paramIndex++;
      }

      if (dataInicio) {
        conditions.push(`data_hora >= $${paramIndex}`);
        params.push(dataInicio);
        paramIndex++;
      }

      if (dataFim) {
        conditions.push(`data_hora <= $${paramIndex}`);
        params.push(dataFim);
        paramIndex++;
      }

      if (usuarioId) {
        conditions.push(`usuario_id = $${paramIndex}`);
        params.push(usuarioId);
        paramIndex++;
      }

      if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
      }

      query += ` ORDER BY data_hora DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit), offset);

      const result = await db.query(query, params);

      let countQuery = 'SELECT COUNT(*) as total FROM logs_sistema WHERE 1=1';
      if (conditions.length > 0) {
        countQuery += ' AND ' + conditions.join(' AND ');
      }
      const countParams = params.slice(0, -2);
      const totalResult = await db.query(countQuery, countParams);
      const total = parseInt(totalResult.rows[0]?.total || 0);

      return res.status(200).json({
        success: true,
        data: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });

    } catch (error) {
      console.error('Erro ao listar logs:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao carregar logs'
      });
    }
  }

  async listarPorUsuario(req, res) {
    try {
      const { id } = req.params;
      const { limit = 100 } = req.query;

      const result = await db.query(`
        SELECT 
          id,
          acao,
          recurso,
          recurso_id,
          ip,
          sucesso,
          data_hora,
          TO_CHAR(data_hora, 'DD/MM/YYYY HH24:MI:SS') as data_hora_formatada
        FROM logs_sistema
        WHERE usuario_id = $1
        ORDER BY data_hora DESC
        LIMIT $2
      `, [id, limit]);

      return res.status(200).json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      console.error('Erro ao listar logs do usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao carregar logs'
      });
    }
  }
}

module.exports = new LogController();
