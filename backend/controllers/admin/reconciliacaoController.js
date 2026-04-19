// backend/controllers/admin/reconciliacaoController.js
const reconciliacaoService = require('../../services/reconciliacaoService');
const contabilidadeService = require('../../services/contabilidadeService');
const Log = require('../../models/Log');

class ReconciliacaoController {
  async reconciliar(req, res) {
    try {
      const { gateway, startDate, endDate } = req.query;
      
      if (!gateway) {
        return res.status(400).json({ success: false, message: 'Gateway é obrigatório' });
      }
      
      const result = await reconciliacaoService.reconciliarPagamentos(
        gateway, 
        startDate || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate || new Date().toISOString().split('T')[0]
      );
      
      await Log.registrar({
        usuarioId: req.user.id,
        usuarioNome: req.user.name,
        usuarioRole: req.user.role,
        acao: 'RECONCILIAR_PAGAMENTOS',
        recurso: 'financeiro',
        dadosNovos: { gateway, result: result.data },
        ip: req.ip,
        sucesso: true
      });
      
      res.json(result);
      
    } catch (error) {
      console.error('Erro na reconciliação:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
  
  async reconciliarTodos(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      const result = await reconciliacaoService.reconciliarTodosGateways(
        startDate || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate || new Date().toISOString().split('T')[0]
      );
      
      res.json({ success: true, data: result });
      
    } catch (error) {
      console.error('Erro na reconciliação geral:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
  
  async verificarDivergencias(req, res) {
    try {
      const result = await reconciliacaoService.verificarDivergenciasPendentes();
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Erro ao verificar divergências:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
  
  async sincronizarStatus(req, res) {
    try {
      const { reservationCode, gatewayStatus } = req.body;
      
      const result = await reconciliacaoService.sincronizarStatusPagamento(
        reservationCode,
        gatewayStatus
      );
      
      res.json({ success: true, data: result });
      
    } catch (error) {
      console.error('Erro na sincronização:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
  
  async gerarRelatorioContabil(req, res) {
    try {
      const { startDate, endDate, categoria, formato } = req.query;
      
      const relatorio = await contabilidadeService.gerarRelatorioFinanceiro(
        startDate || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate || new Date().toISOString().split('T')[0],
        categoria
      );
      
      if (formato === 'csv') {
        const csv = await contabilidadeService.exportarCSV(relatorio);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=relatorio_contabil_${new Date().toISOString().split('T')[0]}.csv`);
        return res.send(csv);
      }
      
      if (formato === 'xml') {
        const xml = await contabilidadeService.exportarXML(relatorio);
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Content-Disposition', `attachment; filename=relatorio_contabil_${new Date().toISOString().split('T')[0]}.xml`);
        return res.send(xml);
      }
      
      res.json({ success: true, data: relatorio });
      
    } catch (error) {
      console.error('Erro ao gerar relatório contábil:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
  
  async simularPagamento(req, res) {
    try {
      const { gateway, phone, cardNumber, amount, reference } = req.body;
      
      let result;
      if (gateway === 'mpesa') {
        result = await reconciliacaoService.gateways.mpesa.simulatePayment(phone, amount, reference);
      } else if (gateway === 'stripe') {
        result = await reconciliacaoService.gateways.stripe.simulatePayment(cardNumber, amount, reference);
      } else {
        return res.status(400).json({ success: false, message: 'Gateway inválido' });
      }
      
      res.json({ success: true, data: result });
      
    } catch (error) {
      console.error('Erro na simulação:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ReconciliacaoController();