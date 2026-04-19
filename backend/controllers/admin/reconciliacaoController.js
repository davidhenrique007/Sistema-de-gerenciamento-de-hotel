const ReconciliacaoService = require('../../services/ReconciliacaoService');

class ReconciliacaoController {
  async reconciliar(req, res) {
    try {
      const gateway = req.query.gateway || req.body.gateway;
      const startDate = req.query.startDate || req.body.startDate;
      const endDate = req.query.endDate || req.body.endDate;
      
      if (!gateway || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetros obrigatórios: gateway, startDate, endDate'
        });
      }
      
      const result = await ReconciliacaoService.reconciliarPagamentos(gateway, startDate, endDate);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Erro na reconciliação:', error);
      res.status(500).json({ success: false, message: 'Erro ao realizar reconciliação', error: error.message });
    }
  }
  
  async reconciliarTodos(req, res) {
    try {
      const startDate = req.query.startDate || req.body.startDate;
      const endDate = req.query.endDate || req.body.endDate;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ success: false, message: 'Parâmetros obrigatórios: startDate, endDate' });
      }
      
      const result = await ReconciliacaoService.reconciliarTodosGateways(startDate, endDate);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Erro na reconciliação de todos gateways:', error);
      res.status(500).json({ success: false, message: 'Erro ao realizar reconciliação', error: error.message });
    }
  }
  
  async verificarDivergencias(req, res) {
    try {
      const result = await ReconciliacaoService.verificarDivergenciasPendentes();
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Erro ao verificar divergências:', error);
      res.status(500).json({ success: false, message: 'Erro ao verificar divergências', error: error.message });
    }
  }
  
  async sincronizarStatus(req, res) {
    try {
      const { reservationCode, gatewayStatus } = req.body;
      
      if (!reservationCode || !gatewayStatus) {
        return res.status(400).json({ success: false, message: 'Parâmetros obrigatórios: reservationCode, gatewayStatus' });
      }
      
      const result = await ReconciliacaoService.sincronizarStatusPagamento(reservationCode, gatewayStatus);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Erro ao sincronizar status:', error);
      res.status(500).json({ success: false, message: 'Erro ao sincronizar status de pagamento', error: error.message });
    }
  }
  
  async liberarReservasPendentes(req, res) {
    try {
      const { horasLimite } = req.body;
      const limite = horasLimite || 24;
      const result = await ReconciliacaoService.liberarReservasPendentes(limite);
      res.json({ success: true, data: result, message: `${result.canceladas} reservas canceladas com sucesso` });
    } catch (error) {
      console.error('Erro ao liberar reservas:', error);
      res.status(500).json({ success: false, message: 'Erro ao liberar reservas pendentes', error: error.message });
    }
  }
  
  async verificarReservasPendentes(req, res) {
    try {
      const result = await ReconciliacaoService.verificarReservasPendentes();
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Erro ao verificar reservas:', error);
      res.status(500).json({ success: false, message: 'Erro ao verificar reservas pendentes', error: error.message });
    }
  }
  
  async simularPagamentoMpesa(req, res) {
    try {
      const { phone, amount, reference } = req.body;
      if (!phone || !amount) {
        return res.status(400).json({ success: false, message: 'Parâmetros obrigatórios: phone, amount' });
      }
      const result = await ReconciliacaoService.simularPagamentoMpesa(phone, amount, reference);
      res.json(result);
    } catch (error) {
      console.error('Erro na simulação M-Pesa:', error);
      res.status(500).json({ success: false, message: 'Erro ao simular pagamento', error: error.message });
    }
  }
  
  async simularPagamentoStripe(req, res) {
    try {
      const { cardNumber, amount, reference } = req.body;
      if (!cardNumber || !amount) {
        return res.status(400).json({ success: false, message: 'Parâmetros obrigatórios: cardNumber, amount' });
      }
      const result = await ReconciliacaoService.simularPagamentoStripe(cardNumber, amount, reference);
      res.json(result);
    } catch (error) {
      console.error('Erro na simulação Stripe:', error);
      res.status(500).json({ success: false, message: 'Erro ao simular pagamento', error: error.message });
    }
  }
}

module.exports = new ReconciliacaoController();
