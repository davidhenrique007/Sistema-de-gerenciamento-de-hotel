// backend/controllers/admin/dashboardAnalisesController.js
const pool = require('../../config/database');

const dashboardAnalisesController = {
  async getOcupacaoDiaria(req, res) {
    try {
      const { inicio, fim } = req.query;
      
      const result = await pool.query(`
        SELECT 
          DATE(created_at) as data,
          COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as ocupados,
          ROUND(COUNT(CASE WHEN status = 'confirmed' THEN 1 END)::numeric / 43 * 100, 2) as ocupacao
        FROM reservations
        WHERE DATE(created_at) BETWEEN $1 AND $2
        GROUP BY DATE(created_at)
        ORDER BY data
      `, [inicio, fim]);
      
      res.json({ success: true, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  
  async getReceitaComparativa(req, res) {
    try {
      const { inicio, fim } = req.query;
      
      const result = await pool.query(`
        SELECT 
          DATE_TRUNC('month', payment_confirmed_at) as mes,
          COALESCE(SUM(total_price), 0) as receita
        FROM reservations
        WHERE payment_status = 'paid'
          AND payment_confirmed_at BETWEEN $1 AND $2
        GROUP BY DATE_TRUNC('month', payment_confirmed_at)
        ORDER BY mes
      `, [inicio, fim]);
      
      res.json({ success: true, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  
  async getDistribuicaoQuartos(req, res) {
    try {
      const { inicio, fim } = req.query;
      
      const result = await pool.query(`
        SELECT 
          rm.type as tipo,
          COUNT(*) as total,
          ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM reservations WHERE DATE(created_at) BETWEEN $1 AND $2) * 100, 2) as percentual
        FROM reservations r
        JOIN rooms rm ON r.room_id = rm.id
        WHERE DATE(r.created_at) BETWEEN $1 AND $2
        GROUP BY rm.type
        ORDER BY total DESC
      `, [inicio, fim]);
      
      res.json({ success: true, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = dashboardAnalisesController;