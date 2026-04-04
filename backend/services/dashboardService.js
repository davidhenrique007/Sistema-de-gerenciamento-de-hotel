const pool = require('../config/database');

class DashboardService {
  async getReservasHoje() {
    const hoje = new Date().toISOString().split('T')[0];
    const result = await pool.query(
      `SELECT COUNT(*) as total 
       FROM reservations 
       WHERE DATE(created_at) = $1 
       AND status = 'confirmed'`,
      [hoje]
    );
    return parseInt(result.rows[0].total);
  }

  async getReservasMes() {
    const result = await pool.query(
      `SELECT COUNT(*) as total 
       FROM reservations 
       WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
       AND status = 'confirmed'`
    );
    return parseInt(result.rows[0].total);
  }

  async getQuartosOcupados() {
    const result = await pool.query(
      `SELECT COUNT(*) as total 
       FROM rooms 
       WHERE status = 'occupied'`
    );
    return parseInt(result.rows[0].total);
  }

  async getQuartosDisponiveis() {
    const result = await pool.query(
      `SELECT COUNT(*) as total 
       FROM rooms 
       WHERE status = 'available'`
    );
    return parseInt(result.rows[0].total);
  }

  async getReceitaDia() {
    const hoje = new Date().toISOString().split('T')[0];
    const result = await pool.query(
      `SELECT COALESCE(SUM(total_price), 0) as total 
       FROM reservations 
       WHERE DATE(payment_confirmed_at) = $1 
       AND payment_status = 'paid'`,
      [hoje]
    );
    return parseFloat(result.rows[0].total);
  }

  async getReceitaMes() {
    const result = await pool.query(
      `SELECT COALESCE(SUM(total_price), 0) as total 
       FROM reservations 
       WHERE DATE_TRUNC('month', payment_confirmed_at) = DATE_TRUNC('month', CURRENT_DATE)
       AND payment_status = 'paid'`
    );
    return parseFloat(result.rows[0].total);
  }

  async getTaxaOcupacao() {
    const totalQuartos = await pool.query(`SELECT COUNT(*) as total FROM rooms`);
    const ocupados = await pool.query(`SELECT COUNT(*) as total FROM rooms WHERE status = 'occupied'`);
    
    const total = parseInt(totalQuartos.rows[0].total);
    const ocupado = parseInt(ocupados.rows[0].total);
    
    if (total === 0) return 0;
    return Math.round((ocupado / total) * 100);
  }

  async getVariacaoDia() {
    const hoje = new Date().toISOString().split('T')[0];
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const ontemStr = ontem.toISOString().split('T')[0];

    const hojeReservas = await this.getReservasHoje();
    
    const ontemReservas = await pool.query(
      `SELECT COUNT(*) as total 
       FROM reservations 
       WHERE DATE(created_at) = $1 
       AND status = 'confirmed'`,
      [ontemStr]
    );
    
    const ontemTotal = parseInt(ontemReservas.rows[0].total);
    if (ontemTotal === 0) return hojeReservas > 0 ? 100 : 0;
    
    return Math.round(((hojeReservas - ontemTotal) / ontemTotal) * 100);
  }

  async getDashboardData() {
    const [
      reservasHoje,
      reservasMes,
      quartosOcupados,
      quartosDisponiveis,
      receitaDia,
      receitaMes,
      taxaOcupacao,
      variacao
    ] = await Promise.all([
      this.getReservasHoje(),
      this.getReservasMes(),
      this.getQuartosOcupados(),
      this.getQuartosDisponiveis(),
      this.getReceitaDia(),
      this.getReceitaMes(),
      this.getTaxaOcupacao(),
      this.getVariacaoDia()
    ]);

    return {
      reservasHoje,
      reservasMes,
      quartosOcupados,
      quartosDisponiveis,
      receitaDia,
      receitaMes,
      taxaOcupacao,
      variacaoPercentual: variacao,
      ultimaAtualizacao: new Date().toISOString()
    };
  }
}

module.exports = new DashboardService();
