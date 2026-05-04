// backend/controllers/admin/financeiroController.js
const db = require('../../config/database');
const Log = require('../../models/Log');

class FinanceiroController {
  async getDashboard(req, res) {
    try {
      const { startDate, endDate, groupBy = 'method' } = req.query;
      
      const hoje = new Date().toISOString().split('T')[0];
      const dataInicio = startDate || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
      const dataFim = endDate || hoje;

      // 1. Pagamentos Pendentes
      const pendingPaymentsResult = await db.query(`
        SELECT 
          COUNT(*) as total_reservas,
          COALESCE(SUM(total_price), 0) as total_valor
        FROM reservations
        WHERE payment_status IN ('pending', 'partial')
        AND status = 'confirmed'
        AND check_in >= $1
      `, [dataInicio]);

      // 2. Pagamentos por método
      const paymentsByMethod = await db.query(`
        SELECT 
          COALESCE(payment_method, 'nao_informado') as metodo,
          COUNT(*) as quantidade,
          COALESCE(SUM(total_price), 0) as valor_total
        FROM reservations
        WHERE payment_status = 'paid'
        AND status = 'confirmed'
        AND check_in >= $1
        GROUP BY payment_method
        ORDER BY valor_total DESC
      `, [dataInicio]);

      // 3. Inadimplência (reservas expiradas sem pagamento)
      const badDebtResult = await db.query(`
        SELECT 
          COUNT(*) as total_reservas,
          COALESCE(SUM(total_price), 0) as valor_perdido
        FROM reservations
        WHERE payment_status IN ('pending', 'partial')
        AND status = 'confirmed'
        AND check_in < $1
      `, [hoje]);

      // 4. Cancelamentos
      const cancellationsResult = await db.query(`
        SELECT 
          COUNT(*) as total_cancelamentos,
          COALESCE(SUM(total_price), 0) as valor_perdido
        FROM reservations
        WHERE status = 'cancelled'
        AND check_in >= $1
      `, [dataInicio]);

      // 5. Total de reservas do período
      const totalReservasResult = await db.query(`
        SELECT 
          COUNT(*) as total,
          COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_price ELSE 0 END), 0) as receita_realizada,
          COALESCE(SUM(CASE WHEN payment_status IN ('pending', 'partial') THEN total_price ELSE 0 END), 0) as receita_pendente
        FROM reservations
        WHERE status = 'confirmed'
        AND check_in >= $1
      `, [dataInicio]);

      const pendingPayments = {
        totalReservas: parseInt(pendingPaymentsResult.rows[0]?.total_reservas || 0),
        totalValor: parseFloat(pendingPaymentsResult.rows[0]?.total_valor || 0)
      };

      const badDebt = {
        totalReservas: parseInt(badDebtResult.rows[0]?.total_reservas || 0),
        valorPerdido: parseFloat(badDebtResult.rows[0]?.valor_perdido || 0)
      };

      const cancellations = {
        total: parseInt(cancellationsResult.rows[0]?.total_cancelamentos || 0),
        valorPerdido: parseFloat(cancellationsResult.rows[0]?.valor_perdido || 0)
      };

      const totalReservas = {
        total: parseInt(totalReservasResult.rows[0]?.total || 0),
        receitaRealizada: parseFloat(totalReservasResult.rows[0]?.receita_realizada || 0),
        receitaPendente: parseFloat(totalReservasResult.rows[0]?.receita_pendente || 0)
      };

      const taxaInadimplencia = totalReservas.total > 0 
        ? (badDebt.totalReservas / totalReservas.total) * 100 
        : 0;
      
      const taxaCancelamento = totalReservas.total > 0 
        ? (cancellations.total / (totalReservas.total + cancellations.total)) * 100 
        : 0;

      // Método dominante
      let metodoDominante = null;
      if (paymentsByMethod.rows.length > 0) {
        metodoDominante = paymentsByMethod.rows.reduce((max, curr) => 
          parseFloat(curr.valor_total) > parseFloat(max.valor_total) ? curr : max
        );
      }

      // Processar métodos de pagamento para gráfico
      const paymentMethods = {
        cash: { valor: 0, percentual: 0, quantidade: 0 },
        mpesa: { valor: 0, percentual: 0, quantidade: 0 },
        card: { valor: 0, percentual: 0, quantidade: 0 },
        outros: { valor: 0, percentual: 0, quantidade: 0 }
      };

      const totalPago = paymentsByMethod.rows.reduce((sum, m) => sum + parseFloat(m.valor_total), 0);

      paymentsByMethod.rows.forEach(m => {
        const metodo = (m.metodo || '').toLowerCase();
        const valor = parseFloat(m.valor_total);
        const percentual = totalPago > 0 ? (valor / totalPago) * 100 : 0;
        
        if (metodo.includes('dinheiro') || metodo === 'cash') {
          paymentMethods.cash = { valor, percentual, quantidade: parseInt(m.quantidade) };
        } else if (metodo.includes('mpesa')) {
          paymentMethods.mpesa = { valor, percentual, quantidade: parseInt(m.quantidade) };
        } else if (metodo.includes('cartao') || metodo === 'card') {
          paymentMethods.card = { valor, percentual, quantidade: parseInt(m.quantidade) };
        } else {
          paymentMethods.outros = { valor, percentual, quantidade: parseInt(m.quantidade) };
        }
      });

      await Log.registrar({
        usuarioId: req.user.id,
        usuarioNome: req.user.name,
        usuarioRole: req.user.role,
        acao: 'VIEW_FINANCIAL_REPORT',
        recurso: 'financeiro',
        ip: req.ip,
        sucesso: true
      });

      res.json({
        success: true,
        summary: {
          pendingPayments: pendingPayments.totalValor,
          totalPendingReservations: pendingPayments.totalReservas,
          badDebt: badDebt.valorPerdido,
          badDebtRate: parseFloat(taxaInadimplencia.toFixed(2)),
          cancellationRate: parseFloat(taxaCancelamento.toFixed(2)),
          cancellationLoss: cancellations.valorPerdido,
          totalRevenue: totalReservas.receitaRealizada,
          projectedRevenue: totalReservas.receitaPendente,
          dominantMethod: metodoDominante ? {
            name: metodoDominante.metodo,
            value: parseFloat(metodoDominante.valor_total),
            percentage: totalPago > 0 ? (parseFloat(metodoDominante.valor_total) / totalPago) * 100 : 0
          } : null
        },
        paymentMethods,
        totalReservas
      });

    } catch (error) {
      console.error('Erro no dashboard financeiro:', error);
      res.status(500).json({ success: false, message: 'Erro ao carregar dados financeiros' });
    }
  }

  async getCashflow(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      const hoje = new Date();
      const dataInicio = startDate || hoje.toISOString().split('T')[0];
      const dataFim = endDate || new Date(hoje.setDate(hoje.getDate() + 30)).toISOString().split('T')[0];

      // Buscar reservas confirmadas para projeção
      const reservas = await db.query(`
        SELECT 
          check_in,
          total_price,
          payment_status
        FROM reservations
        WHERE status = 'confirmed'
        AND check_in >= $1
        AND check_in <= $2
        ORDER BY check_in ASC
      `, [dataInicio, dataFim]);

      // Agrupar por dia
      const fluxoMap = new Map();
      
      // Inicializar próximos 30 dias
      for (let i = 0; i <= 30; i++) {
        const data = new Date();
        data.setDate(data.getDate() + i);
        const dataStr = data.toISOString().split('T')[0];
        fluxoMap.set(dataStr, { entrada: 0, saida: 0, data: dataStr });
      }

      // Preencher com reservas
      reservas.rows.forEach(r => {
        const dataCheckin = new Date(r.check_in).toISOString().split('T')[0];
        const valor = parseFloat(r.total_price);
        
        if (fluxoMap.has(dataCheckin)) {
          const item = fluxoMap.get(dataCheckin);
          item.entrada += r.payment_status === 'paid' ? valor : valor * 0.7;
          fluxoMap.set(dataCheckin, item);
        }
      });

      // Calcular saldo acumulado
      let saldoAcumulado = 0;
      const cashflowArray = [];
      
      for (const [data, value] of fluxoMap) {
        saldoAcumulado += value.entrada - value.saida;
        cashflowArray.push({
          data: new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          entrada: value.entrada,
          saida: value.saida,
          saldo: saldoAcumulado,
          isProjetado: true
        });
      }

      // Calcular métricas de tendência
      const entradas = cashflowArray.map(c => c.entrada);
      const mediaEntradas = entradas.reduce((a, b) => a + b, 0) / entradas.length;
      const picoEntrada = Math.max(...entradas);
      const totalProjetado = cashflowArray.reduce((a, b) => a + b.entrada, 0);

      res.json({
        success: true,
        data: cashflowArray,
        summary: {
          totalProjetado,
          mediaDiaria: mediaEntradas,
          picoDiario: picoEntrada,
          saldoFinal: saldoAcumulado
        }
      });

    } catch (error) {
      console.error('Erro no fluxo de caixa:', error);
      res.status(500).json({ success: false, message: 'Erro ao carregar fluxo de caixa' });
    }
  }
}

module.exports = new FinanceiroController();