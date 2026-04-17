const db = require('../../config/database');

class DashboardController {
  async getMetrics(req, res) {
    try {
      console.log('📊 Dashboard - Buscando métricas...');
      
      // Usar a MESMA lógica do reservaAdminController
      const dateResult = await db.query(`
        SELECT TO_CHAR(NOW() AT TIME ZONE 'Africa/Maputo', 'YYYY-MM-DD') as hoje
      `);
      const hoje = dateResult.rows[0].hoje;
      
      console.log(`📅 Dashboard - Data de hoje: ${hoje}`);
      
      // RESERVAS HOJE - Mesma query do reservaAdminController
      const reservasHojeResult = await db.query(`
        SELECT COUNT(*) as total FROM reservations
        WHERE TO_CHAR(check_in AT TIME ZONE 'Africa/Maputo', 'YYYY-MM-DD') = $1
        AND status IN ('confirmed', 'pending')
      `, [hoje]);
      
      // RESERVAS NO MÊS
      const reservasMesResult = await db.query(`
        SELECT COUNT(*) as total FROM reservations
        WHERE TO_CHAR(check_in AT TIME ZONE 'Africa/Maputo', 'YYYY-MM') = TO_CHAR(NOW() AT TIME ZONE 'Africa/Maputo', 'YYYY-MM')
        AND status IN ('confirmed', 'pending')
      `);
      
      // QUARTOS OCUPADOS
      const quartosOcupadosResult = await db.query(`
        SELECT COUNT(*) as total FROM rooms WHERE status = 'occupied'
      `);
      
      // QUARTOS DISPONÍVEIS
      const quartosDisponiveisResult = await db.query(`
        SELECT COUNT(*) as total FROM rooms WHERE status = 'available'
      `);
      
      // RECEITA HOJE
      const receitaHojeResult = await db.query(`
        SELECT COALESCE(SUM(total_price), 0) as total FROM reservations
        WHERE TO_CHAR(check_in AT TIME ZONE 'Africa/Maputo', 'YYYY-MM-DD') = $1
        AND status = 'confirmed'
        AND payment_status = 'paid'
      `, [hoje]);
      
      // RECEITA NO MÊS
      const receitaMesResult = await db.query(`
        SELECT COALESCE(SUM(total_price), 0) as total FROM reservations
        WHERE TO_CHAR(check_in AT TIME ZONE 'Africa/Maputo', 'YYYY-MM') = TO_CHAR(NOW() AT TIME ZONE 'Africa/Maputo', 'YYYY-MM')
        AND status = 'confirmed'
        AND payment_status = 'paid'
      `);
      
      // TOTAL DE QUARTOS para calcular taxa
      const totalQuartosResult = await db.query(`
        SELECT COUNT(*) as total FROM rooms
      `);
      
      const totalQuartos = totalQuartosResult.rows[0].total;
      const quartosOcupados = parseInt(quartosOcupadosResult.rows[0]?.total || 0);
      const taxaOcupacao = totalQuartos > 0 ? Math.round((quartosOcupados / totalQuartos) * 100) : 0;
      
      const reservasHoje = parseInt(reservasHojeResult.rows[0]?.total || 0);
      const reservasMes = parseInt(reservasMesResult.rows[0]?.total || 0);
      
      console.log(`📊 Dashboard - Resultados: ReservasHoje=${reservasHoje}, ReservasMes=${reservasMes}, QuartosOcupados=${quartosOcupados}`);
      
      const metrics = {
        reservasHoje: reservasHoje,
        reservasMes: reservasMes,
        quartosOcupados: quartosOcupados,
        quartosDisponiveis: parseInt(quartosDisponiveisResult.rows[0]?.total || 0),
        receitaHoje: parseFloat(receitaHojeResult.rows[0]?.total || 0),
        receitaMes: parseFloat(receitaMesResult.rows[0]?.total || 0),
        taxaOcupacao: taxaOcupacao,
        ultimaAtualizacao: new Date().toISOString()
      };
      
      res.json({ success: true, data: metrics });
      
    } catch (error) {
      console.error('❌ Erro no dashboard:', error);
      res.status(500).json({ success: false, message: 'Erro ao carregar métricas' });
    }
  }
}

module.exports = new DashboardController();
