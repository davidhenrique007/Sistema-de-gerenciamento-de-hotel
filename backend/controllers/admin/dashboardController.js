const pool = require('../../config/database');
const dashboardService = require('../../services/dashboardService');

class DashboardController {
  async getMetrics(req, res) {
    try {
      console.log('📊 Buscando métricas do dashboard...');
      const data = await dashboardService.getDashboardData();
      
      console.log('✅ Métricas encontradas:', data);
      
      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erro ao buscar métricas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao carregar métricas do dashboard',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getOcupacaoPorTipo(req, res) {
    try {
      console.log('📊 Buscando ocupação por tipo...');
      
      const result = await pool.query(`
        SELECT 
          rm.type as tipo_quarto,
          COUNT(*) as total_quartos,
          SUM(CASE WHEN rm.status = 'occupied' THEN 1 ELSE 0 END) as ocupados,
          ROUND(SUM(CASE WHEN rm.status = 'occupied' THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric * 100, 2) as percentual
        FROM rooms rm
        GROUP BY rm.type
        ORDER BY rm.type
      `);
      
      console.log('✅ Dados de ocupação encontrados:', result.rows.length);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('❌ Erro ao buscar ocupação por tipo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao carregar mapa de ocupação'
      });
    }
  }
}

module.exports = new DashboardController();
