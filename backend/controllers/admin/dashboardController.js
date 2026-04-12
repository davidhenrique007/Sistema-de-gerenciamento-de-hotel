const pool = require('../../config/database');
const dashboardService = require('../../services/dashboardService');

const dashboardController = {
  async getMetrics(req, res) {
    try {
      console.log('📊 Buscando métricas do dashboard...');
      const data = await dashboardService.getDashboardData();
      
      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erro ao buscar métricas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao carregar métricas do dashboard'
      });
    }
  },

  async getOcupacaoPorTipo(req, res) {
    try {
      console.log('📊 Buscando ocupação por tipo...');
      
      const result = await pool.query(`
        SELECT 
          rm.type as tipo_quarto,
          COUNT(*) as total_quartos,
          SUM(CASE WHEN rm.status = 'occupied' THEN 1 ELSE 0 END) as ocupados
        FROM rooms rm
        GROUP BY rm.type
        ORDER BY rm.type
      `);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('❌ Erro ao buscar ocupação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao carregar mapa de ocupação'
      });
    }
  }
};

module.exports = dashboardController;
