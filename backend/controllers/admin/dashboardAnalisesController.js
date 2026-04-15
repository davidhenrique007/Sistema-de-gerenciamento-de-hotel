// backend/controllers/admin/dashboardController.js (atualizado com cache)
const db = require('../../config/database');
const cache = require('../../config/cache');
const Log = require('../../models/Log');

class DashboardController {
  async getMetrics(req, res) {
    const hotelId = req.user?.hotelId || 'default';
    const cacheKey = `dashboard:metrics:${hotelId}`;
    
    try {
      const metrics = await cache.getOrSet(cacheKey, async () => {
        console.log('📊 Fetching fresh dashboard metrics from DB...');
        
        const hoje = new Date().toISOString().split('T')[0];
        
        const [reservasHoje, checkinsPendentes, pagamentosAtrasados, ocupacao, receitaMes] = await Promise.all([
          db.query(`
            SELECT COUNT(*) as total FROM reservations 
            WHERE check_in::date = $1 AND status = 'confirmed'
          `, [hoje]),
          db.query(`
            SELECT COUNT(*) as total FROM reservations 
            WHERE check_in::date = $1 AND status = 'confirmed' AND check_in_real IS NULL
          `, [hoje]),
          db.query(`
            SELECT COUNT(*) as total FROM reservations 
            WHERE payment_status = 'pending' AND check_in::date < $1 AND status = 'confirmed'
          `, [hoje]),
          db.query(`
            SELECT COUNT(*) as ocupados, (SELECT COUNT(*) FROM rooms) as total 
            FROM rooms WHERE status = 'occupied'
          `),
          db.query(`
            SELECT COALESCE(SUM(total_price), 0) as total FROM reservations 
            WHERE EXTRACT(MONTH FROM check_in) = EXTRACT(MONTH FROM NOW())
            AND EXTRACT(YEAR FROM check_in) = EXTRACT(YEAR FROM NOW())
            AND status = 'confirmed'
          `)
        ]);
        
        const ocupacaoPercentual = ocupacao.rows[0]?.total > 0 
          ? Math.round((ocupacao.rows[0].ocupados / ocupacao.rows[0].total) * 100)
          : 0;
        
        return {
          reservasHoje: parseInt(reservasHoje.rows[0]?.total || 0),
          checkinsPendentes: parseInt(checkinsPendentes.rows[0]?.total || 0),
          pagamentosAtrasados: parseInt(pagamentosAtrasados.rows[0]?.total || 0),
          taxaOcupacao: ocupacaoPercentual,
          receitaMes: parseFloat(receitaMes.rows[0]?.total || 0),
          ultimaAtualizacao: new Date().toISOString()
        };
      });
      
      res.json({ success: true, data: metrics });
      
    } catch (error) {
      console.error('Dashboard metrics error:', error);
      res.status(500).json({ success: false, message: 'Erro ao carregar métricas' });
    }
  }
  
  async invalidateCache(req, res) {
    const hotelId = req.user?.hotelId || 'default';
    await cache.invalidateDashboard(hotelId);
    
    await Log.registrar({
      usuarioId: req.user.id,
      usuarioNome: req.user.name,
      usuarioRole: req.user.role,
      acao: 'INVALIDATE_CACHE',
      recurso: 'dashboard',
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    
    res.json({ success: true, message: 'Cache invalidado com sucesso' });
  }
}

module.exports = new DashboardController();