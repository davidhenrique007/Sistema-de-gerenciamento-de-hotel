// backend/controllers/adminController.js
const reconciliacaoService = require('../services/reconciliacaoService');
const liberarQuartosJob = require('../services/jobs/liberarQuartosJob');

class AdminController {
    /**
     * Confirmar pagamento em dinheiro
     */
    async confirmarPagamentoDinheiro(req, res) {
        const { reservaId } = req.body;
        
        if (!reservaId) {
            return res.status(400).json({
                error: true,
                message: 'reservaId é obrigatório'
            });
        }
        
        try {
            const result = await reconciliacaoService.confirmarPagamentoDinheiro(reservaId);
            
            res.json({
                success: true,
                message: 'Pagamento confirmado com sucesso',
                data: result
            });
            
        } catch (error) {
            console.error('❌ Erro ao confirmar pagamento:', error);
            res.status(500).json({
                error: true,
                message: error.message || 'Erro ao confirmar pagamento'
            });
        }
    }
    
    /**
     * Executar job manualmente
     */
    async executarJob(req, res) {
        try {
            const resultado = await liberarQuartosJob.execute();
            
            res.json({
                success: true,
                message: 'Job executado com sucesso',
                data: resultado
            });
            
        } catch (error) {
            console.error('❌ Erro ao executar job:', error);
            res.status(500).json({
                error: true,
                message: 'Erro ao executar job'
            });
        }
    }
    
    /**
     * Verificar status das reservas pendentes
     */
    async verificarStatusPendentes(req, res) {
        try {
            const status = await reconciliacaoService.verificarReservasPendentes();
            
            res.json({
                success: true,
                data: status
            });
            
        } catch (error) {
            console.error('❌ Erro ao verificar status:', error);
            res.status(500).json({
                error: true,
                message: 'Erro ao verificar status'
            });
        }
    }
}

module.exports = new AdminController();