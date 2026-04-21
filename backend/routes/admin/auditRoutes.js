// =====================================================
// ROTAS DE AUDITORIA - HOTEL PARADISE
// =====================================================

const express = require('express');
const router = express.Router();
const { verificarToken, verificarRole } = require('../../middlewares/auth');
const auditService = require('../../services/auditService');

// Todas as rotas requerem autenticação e role admin
router.use(verificarToken);
router.use(verificarRole(['admin']));

// Listar logs de auditoria
router.get('/logs', async (req, res) => {
  try {
    const filters = {
      userId: req.query.userId,
      acao: req.query.acao,
      entidade: req.query.entidade,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0
    };

    const result = await auditService.getLogs(filters);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.offset + result.limit < result.total
      }
    });
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar logs de auditoria'
    });
  }
});

// Obter estatísticas de auditoria
router.get('/logs/stats', async (req, res) => {
  try {
    const db = require('../../config/database');
    
    const acoes = await db.query(`
      SELECT acao, COUNT(*) as total 
      FROM audit_logs 
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY acao
      ORDER BY total DESC
      LIMIT 20
    `);

    const porDia = await db.query(`
      SELECT DATE(created_at) as data, COUNT(*) as total
      FROM audit_logs
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY data DESC
    `);

    const porUsuario = await db.query(`
      SELECT user_name, COUNT(*) as total
      FROM audit_logs
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY user_name
      ORDER BY total DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        acoes: acoes.rows,
        porDia: porDia.rows,
        porUsuario: porUsuario.rows
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas de auditoria'
    });
  }
});

// Buscar detalhes de um log específico
router.get('/logs/:id', async (req, res) => {
  try {
    const db = require('../../config/database');
    const result = await db.query(
      'SELECT * FROM audit_logs WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Log não encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar log:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar detalhes do log'
    });
  }
});

// Exportar logs (CSV)
router.get('/logs/export/csv', async (req, res) => {
  try {
    const result = await auditService.getLogs({
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: 10000
    });
    
    const logs = result.data;
    const headers = ['ID', 'Utilizador', 'Ação', 'Entidade', 'IP', 'Status', 'Data'];
    const rows = logs.map(log => [
      log.id,
      log.user_name || '',
      log.acao,
      log.entidade,
      log.ip || '',
      log.status,
      new Date(log.created_at).toLocaleString('pt-BR')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=audit_logs_${Date.now()}.csv`);
    res.send(csvContent);
  } catch (error) {
    console.error('Erro ao exportar logs:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao exportar logs'
    });
  }
});

module.exports = router;
