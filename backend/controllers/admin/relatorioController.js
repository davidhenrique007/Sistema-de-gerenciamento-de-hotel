// backend/controllers/admin/relatorioController.js
const relatorioService = require('../../services/relatorioService');
const Log = require('../../models/Log');

class RelatorioController {
  async getReceitaPeriodo(req, res) {
    try {
      const { startDate, endDate, roomType, paymentMethod, groupBy = 'month' } = req.query;
      const data = await relatorioService.getReceitaPorPeriodo({
        startDate, endDate, roomType, paymentMethod, groupBy
      });

      await Log.registrar({
        usuarioId: req.user.id,
        usuarioNome: req.user.name,
        usuarioRole: req.user.role,
        acao: 'VIEW_REVENUE_REPORT',
        recurso: 'report',
        ip: req.ip,
        sucesso: true
      });

      res.json({ success: true, data });
    } catch (error) {
      console.error('Erro ao gerar relatório de receita:', error);
      res.status(500).json({ success: false, message: 'Erro ao carregar relatório' });
    }
  }

  async getComparativo(req, res) {
    try {
      const { startDate, endDate, previousStartDate, previousEndDate, roomType, paymentMethod } = req.query;
      const data = await relatorioService.getComparativoPeriodo({
        startDate, endDate, previousStartDate, previousEndDate, roomType, paymentMethod
      });

      res.json({ success: true, data });
    } catch (error) {
      console.error('Erro ao gerar comparativo:', error);
      res.status(500).json({ success: false, message: 'Erro ao carregar comparativo' });
    }
  }

  async getTendenciaProjecao(req, res) {
    try {
      const { startDate, endDate, roomType, paymentMethod, periodoProjetado = 3 } = req.query;
      const data = await relatorioService.getTendenciaEProjecao({
        startDate, endDate, roomType, paymentMethod, periodoProjetado: parseInt(periodoProjetado)
      });

      res.json({ success: true, data });
    } catch (error) {
      console.error('Erro ao gerar tendência:', error);
      res.status(500).json({ success: false, message: 'Erro ao carregar tendência' });
    }
  }

  async getMetricasDashboard(req, res) {
    try {
      const { startDate, endDate, roomType, paymentMethod } = req.query;
      const data = await relatorioService.getMetricasDashboard({
        startDate, endDate, roomType, paymentMethod
      });

      res.json({ success: true, data });
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      res.status(500).json({ success: false, message: 'Erro ao carregar métricas' });
    }
  }
}

module.exports = new RelatorioController();