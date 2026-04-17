// backend/services/relatorioService.js
const db = require('../config/database');

class RelatorioService {
  constructor() {
    this.taxaImposto = 0.05;
  }

  async getReceitaPorPeriodo({ startDate, endDate, roomType, paymentMethod, groupBy = 'day' }) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    let query = `
      SELECT 
        DATE(r.check_in) as data,
        SUM(r.total_price) as receita,
        COUNT(r.id) as quantidade,
        AVG(r.total_price) as ticket_medio
      FROM reservations r
      INNER JOIN rooms rm ON r.room_id = rm.id
      WHERE r.status = 'confirmed'
      AND r.payment_status = 'paid'
    `;

    if (startDate) {
      conditions.push(`r.check_in >= $${paramIndex++}`);
      params.push(startDate);
    }
    if (endDate) {
      conditions.push(`r.check_in <= $${paramIndex++}`);
      params.push(endDate);
    }
    if (roomType && roomType !== 'todos') {
      conditions.push(`rm.type = $${paramIndex++}`);
      params.push(roomType);
    }
    if (paymentMethod && paymentMethod !== 'todos') {
      conditions.push(`r.payment_method = $${paramIndex++}`);
      params.push(paymentMethod);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    if (groupBy === 'day') {
      query += ` GROUP BY DATE(r.check_in) ORDER BY data ASC`;
    } else if (groupBy === 'week') {
      query += ` GROUP BY DATE_TRUNC('week', r.check_in) ORDER BY DATE_TRUNC('week', r.check_in) ASC`;
    } else if (groupBy === 'month') {
      query += ` GROUP BY DATE_TRUNC('month', r.check_in) ORDER BY DATE_TRUNC('month', r.check_in) ASC`;
    } else if (groupBy === 'year') {
      query += ` GROUP BY DATE_TRUNC('year', r.check_in) ORDER BY DATE_TRUNC('year', r.check_in) ASC`;
    }

    const result = await db.query(query, params);
    return result.rows;
  }

  async getComparativoPeriodo({ startDate, endDate, previousStartDate, previousEndDate, roomType, paymentMethod }) {
    const [currentResult, previousResult] = await Promise.all([
      this.getReceitaPorPeriodo({ startDate, endDate, roomType, paymentMethod }),
      this.getReceitaPorPeriodo({ startDate: previousStartDate, endDate: previousEndDate, roomType, paymentMethod })
    ]);

    const currentRevenue = currentResult.reduce((sum, r) => sum + parseFloat(r.receita), 0);
    const previousRevenue = previousResult.reduce((sum, r) => sum + parseFloat(r.receita), 0);
    const currentCount = currentResult.reduce((sum, r) => sum + parseInt(r.quantidade), 0);
    const previousCount = previousResult.reduce((sum, r) => sum + parseInt(r.quantidade), 0);
    const currentTicketMedio = currentCount > 0 ? currentRevenue / currentCount : 0;
    const previousTicketMedio = previousCount > 0 ? previousRevenue / previousCount : 0;

    const deltaPercent = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const deltaValue = currentRevenue - previousRevenue;
    const deltaQuantidade = previousCount > 0 ? ((currentCount - previousCount) / previousCount) * 100 : 0;

    return {
      current: {
        receita: currentRevenue,
        quantidade: currentCount,
        ticketMedio: currentTicketMedio
      },
      previous: {
        receita: previousRevenue,
        quantidade: previousCount,
        ticketMedio: previousTicketMedio
      },
      comparativo: {
        deltaPercentual: parseFloat(deltaPercent.toFixed(2)),
        deltaAbsoluto: deltaValue,
        deltaQuantidadePercentual: parseFloat(deltaQuantidade.toFixed(2)),
        tendencia: deltaPercent >= 0 ? 'crescimento' : 'queda'
      }
    };
  }

  calcularTendencia(dados) {
    if (dados.length < 2) return { slope: 0, intercept: 0, r2: 0 };

    const n = dados.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    dados.forEach((ponto, i) => {
      const x = i + 1;
      const y = parseFloat(ponto.receita);
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    let ssRes = 0, ssTot = 0;
    const meanY = sumY / n;
    dados.forEach((ponto, i) => {
      const x = i + 1;
      const yPred = slope * x + intercept;
      const y = parseFloat(ponto.receita);
      ssRes += Math.pow(y - yPred, 2);
      ssTot += Math.pow(y - meanY, 2);
    });
    const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

    return { slope, intercept, r2 };
  }

  async getTendenciaEProjecao({ startDate, endDate, roomType, paymentMethod, periodoProjetado = 3 }) {
    const dadosHistoricos = await this.getReceitaPorPeriodo({
      startDate, endDate, roomType, paymentMethod, groupBy: 'month'
    });

    if (dadosHistoricos.length === 0) {
      return { historico: [], tendencia: null, projecao: [] };
    }

    const { slope, intercept, r2 } = this.calcularTendencia(dadosHistoricos);
    const ultimoMes = dadosHistoricos.length;
    const projecao = [];

    for (let i = 1; i <= periodoProjetado; i++) {
      const mesProjetado = ultimoMes + i;
      const receitaProjetada = slope * mesProjetado + intercept;
      projecao.push({
        periodo: `Mês ${mesProjetado}`,
        receita: Math.max(0, receitaProjetada),
        projetado: true
      });
    }

    const historicoComTendencia = dadosHistoricos.map((item, idx) => ({
      ...item,
      tendencia: slope * (idx + 1) + intercept,
      projetado: false
    }));

    return {
      historico: historicoComTendencia,
      tendencia: { slope, intercept, r2, confianca: r2 * 100 },
      projecao
    };
  }

  async getMetricasDashboard({ startDate, endDate, roomType, paymentMethod }) {
    const receita = await this.getReceitaPorPeriodo({ startDate, endDate, roomType, paymentMethod });
    const totalReceita = receita.reduce((sum, r) => sum + parseFloat(r.receita), 0);
    const totalReservas = receita.reduce((sum, r) => sum + parseInt(r.quantidade), 0);
    const ticketMedio = totalReservas > 0 ? totalReceita / totalReservas : 0;

    const hoje = new Date();
    const mesPassado = new Date();
    mesPassado.setMonth(mesPassado.getMonth() - 1);

    const comparativo = await this.getComparativoPeriodo({
      startDate, endDate,
      previousStartDate: mesPassado.toISOString().split('T')[0],
      previousEndDate: hoje.toISOString().split('T')[0],
      roomType, paymentMethod
    });

    return {
      totalReceita,
      totalReservas,
      ticketMedio,
      variacao: comparativo.comparativo.deltaPercentual
    };
  }
}

module.exports = new RelatorioService();