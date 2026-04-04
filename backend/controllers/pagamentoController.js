const pool = require('../config/database');

const pagamentoController = {
  async iniciarPagamentoMpesa(req, res) {
    try {
      const { reservaId, telefone, valor } = req.body;
      const transactionId = `MPESA_${Date.now()}`;
      
      res.json({
        success: true,
        transactionId: transactionId,
        status: 'pending',
        message: 'Pagamento iniciado. Aguarde confirmação.',
        reservaId
      });
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({ success: false, message: 'Erro ao iniciar pagamento' });
    }
  },
  
  async confirmarPagamentoMpesa(req, res) {
    try {
      const { reservaId, transactionId } = req.body;
      res.json({ success: true, message: 'Pagamento confirmado' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro' });
    }
  },
  
  async criarIntentCartao(req, res) {
    try {
      const { valor } = req.body;
      res.json({ success: true, data: { client_secret: `pi_${Date.now()}_secret` } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro' });
    }
  },
  
  async confirmarPagamentoCartao(req, res) {
    try {
      const { payment_intent_id, reservaId } = req.body;
      res.json({ success: true, message: 'Pagamento confirmado' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro' });
    }
  }
};

module.exports = pagamentoController;
