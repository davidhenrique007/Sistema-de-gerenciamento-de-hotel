const pool = require('../config/database');
const Log = require('../models/Log');

class ReconciliacaoService {
  constructor() {
    this.gateways = {
      mpesa: {
        name: 'M-Pesa',
        simulatePayment: this.simularPagamentoMpesa.bind(this),
        fetchTransactions: this.buscarTransacoesMpesa.bind(this)
      },
      stripe: {
        name: 'Stripe',
        simulatePayment: this.simularPagamentoStripe.bind(this),
        fetchTransactions: this.buscarTransacoesStripe.bind(this)
      }
    };
  }

  async simularPagamentoMpesa(phone, amount, reference) {
    console.log(`📱 Simulando pagamento M-Pesa: ${phone} - ${amount} MTn`);
    await new Promise(resolve => setTimeout(resolve, 500));
    const success = Math.random() < 0.9;
    
    if (success) {
      return {
        success: true,
        transactionId: `MPESA_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        amount,
        phone,
        status: 'completed',
        message: 'Pagamento processado com sucesso',
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        success: false,
        error: 'Falha no processamento do pagamento',
        status: 'failed',
        message: 'Transação recusada pelo provedor'
      };
    }
  }
  
  async simularPagamentoStripe(cardNumber, amount, reference) {
    console.log(`💳 Simulando pagamento Stripe: ${cardNumber.slice(-4)} - ${amount} MTn`);
    await new Promise(resolve => setTimeout(resolve, 500));
    const lastDigits = cardNumber.slice(-4);
    const success = lastDigits !== '0000';
    
    if (success) {
      return {
        success: true,
        transactionId: `STRIPE_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        amount,
        cardLast4: lastDigits,
        status: 'succeeded',
        message: 'Pagamento autorizado',
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        success: false,
        error: 'Cartão recusado',
        status: 'failed',
        message: 'Transação não autorizada'
      };
    }
  }
  
  async buscarTransacoesMpesa(startDate, endDate) {
    const transacoes = [];
    const dias = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < Math.min(dias * 2, 50); i++) {
      const data = new Date(startDate.getTime() + Math.random() * (endDate - startDate));
      transacoes.push({
        id: `MPESA_${Date.now()}_${i}`,
        transactionId: `TXN_MPESA_${i}_${Date.now()}`,
        amount: Math.floor(Math.random() * 10000) + 1000,
        phone: `84${Math.floor(Math.random() * 9000000) + 1000000}`,
        status: Math.random() > 0.1 ? 'completed' : 'failed',
        reference: `RES-2026-${Math.floor(Math.random() * 1000)}`,
        timestamp: data.toISOString()
      });
    }
    return transacoes;
  }
  
  async buscarTransacoesStripe(startDate, endDate) {
    const transacoes = [];
    const dias = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < Math.min(dias * 2, 50); i++) {
      const data = new Date(startDate.getTime() + Math.random() * (endDate - startDate));
      transacoes.push({
        id: `STRIPE_${Date.now()}_${i}`,
        transactionId: `ch_${Math.random().toString(36).substr(2, 16)}`,
        amount: Math.floor(Math.random() * 10000) + 1000,
        cardLast4: `${Math.floor(Math.random() * 9000) + 1000}`,
        status: Math.random() > 0.1 ? 'succeeded' : 'failed',
        reference: `RES-2026-${Math.floor(Math.random() * 1000)}`,
        timestamp: data.toISOString()
      });
    }
    return transacoes;
  }

  async reconciliarPagamentos(gateway, startDate, endDate) {
    const client = await pool.connect();
    
    try {
      console.log(`🔄 Iniciando reconciliação para gateway: ${gateway}`);
      console.log(`📅 Período: ${startDate} a ${endDate}`);
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      let transacoesGateway = [];
      if (gateway === 'mpesa') {
        transacoesGateway = await this.buscarTransacoesMpesa(start, end);
      } else if (gateway === 'stripe') {
        transacoesGateway = await this.buscarTransacoesStripe(start, end);
      }
      
      // Buscar pagamentos internos - usando colunas corretas
      const pagamentosInternos = await client.query(`
        SELECT 
          r.id,
          r.reservation_code as reference,
          r.total_price as amount,
          r.payment_status as status,
          r.payment_method,
          r.created_at as payment_date,
          g.name as guest_name
        FROM reservations r
        INNER JOIN guests g ON r.guest_id = g.id
        WHERE r.payment_status = 'paid'
        AND r.status = 'confirmed'
        AND r.created_at BETWEEN $1 AND $2
      `, [startDate, endDate]);
      
      const pagamentosMap = new Map();
      pagamentosInternos.rows.forEach(p => {
        pagamentosMap.set(p.reference, p);
      });
      
      const resultados = {
        gateway,
        periodo: { startDate, endDate },
        totalTransacoesGateway: transacoesGateway.length,
        totalPagamentosInternos: pagamentosInternos.rows.length,
        conciliados: 0,
        divergentes: 0,
        detalhes: []
      };
      
      for (const transacao of transacoesGateway) {
        const pagamentoInterno = pagamentosMap.get(transacao.reference);
        
        if (!pagamentoInterno) {
          resultados.divergentes++;
          resultados.detalhes.push({
            tipo: 'pagamento_nao_encontrado',
            gateway: transacao,
            descricao: `Pagamento registrado no gateway mas não encontrado no sistema interno`,
            severidade: 'critical'
          });
        } else if (Math.abs(transacao.amount - pagamentoInterno.amount) > 0.01) {
          resultados.divergentes++;
          resultados.detalhes.push({
            tipo: 'diferenca_valor',
            gateway: transacao,
            interno: pagamentoInterno,
            descricao: `Divergência de valor: Gateway=${transacao.amount}, Interno=${pagamentoInterno.amount}`,
            severidade: 'high'
          });
        } else {
          resultados.conciliados++;
          resultados.detalhes.push({
            tipo: 'conciliado',
            gateway: transacao,
            interno: pagamentoInterno,
            descricao: `Pagamento conciliado com sucesso`,
            severidade: 'info'
          });
        }
      }
      
      const transacoesGatewaySet = new Set(transacoesGateway.map(t => t.reference));
      for (const pagamento of pagamentosInternos.rows) {
        if (!transacoesGatewaySet.has(pagamento.reference)) {
          resultados.divergentes++;
          resultados.detalhes.push({
            tipo: 'pagamento_sem_gateway',
            interno: pagamento,
            descricao: `Pagamento registrado no sistema mas não encontrado no gateway`,
            severidade: 'warning'
          });
        }
      }
      
      const taxaConciliacao = resultados.totalTransacoesGateway > 0 
        ? (resultados.conciliados / resultados.totalTransacoesGateway) * 100 
        : 0;
      
      await Log.registrar({
        usuarioId: 'system',
        usuarioNome: 'Sistema',
        usuarioRole: 'system',
        acao: 'RECONCILIACAO',
        recurso: 'financeiro',
        dadosNovos: {
          gateway,
          periodo: { startDate, endDate },
          conciliados: resultados.conciliados,
          divergentes: resultados.divergentes,
          taxaConciliacao
        },
        sucesso: true
      });
      
      const alertasCriticos = resultados.detalhes.filter(d => d.severidade === 'critical' || d.severidade === 'high');
      if (alertasCriticos.length > 0) {
        console.warn(`⚠️ ${alertasCriticos.length} divergências críticas encontradas`);
      }
      
      return {
        success: true,
        data: resultados,
        taxaConciliacao,
        alertas: alertasCriticos
      };
      
    } catch (error) {
      console.error('❌ Erro na reconciliação:', error);
      await Log.registrar({
        usuarioId: 'system',
        usuarioNome: 'Sistema',
        usuarioRole: 'system',
        acao: 'RECONCILIACAO_ERROR',
        recurso: 'financeiro',
        mensagemErro: error.message,
        sucesso: false
      });
      throw error;
    } finally {
      client.release();
    }
  }
  
  async verificarDivergenciasPendentes() {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          COUNT(*) as total_pagamentos,
          COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pendentes,
          COUNT(CASE WHEN payment_status = 'pending' AND check_in < NOW() THEN 1 END) as atrasados
        FROM reservations
        WHERE status = 'confirmed'
      `);
      
      return {
        totalPagamentos: parseInt(result.rows[0].total_pagamentos),
        pendentes: parseInt(result.rows[0].pendentes),
        atrasados: parseInt(result.rows[0].atrasados),
        alerta: parseInt(result.rows[0].atrasados) > 5
      };
    } finally {
      client.release();
    }
  }
  
  async reconciliarTodosGateways(startDate, endDate) {
    const resultados = { period: { startDate, endDate }, gateways: {} };
    
    for (const [key] of Object.entries(this.gateways)) {
      try {
        const result = await this.reconciliarPagamentos(key, startDate, endDate);
        resultados.gateways[key] = result.data;
      } catch (error) {
        resultados.gateways[key] = { error: error.message, conciliados: 0, divergentes: 0 };
      }
    }
    return resultados;
  }
  
  async sincronizarStatusPagamento(reservationCode, gatewayStatus) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const reserva = await client.query(`
        SELECT id, payment_status, status FROM reservations 
        WHERE reservation_code = $1
      `, [reservationCode]);
      
      if (reserva.rows.length === 0) {
        throw new Error(`Reserva ${reservationCode} não encontrada`);
      }
      
      const internalStatus = gatewayStatus === 'succeeded' || gatewayStatus === 'completed' ? 'paid' : 'pending';
      
      if (reserva.rows[0].payment_status !== internalStatus) {
        await client.query(`
          UPDATE reservations 
          SET payment_status = $1, 
              updated_at = NOW()
          WHERE reservation_code = $2
        `, [internalStatus, reservationCode]);
        
        await Log.registrar({
          usuarioId: 'system',
          usuarioNome: 'Sistema',
          usuarioRole: 'system',
          acao: 'SYNC_PAYMENT_STATUS',
          recurso: 'reservation',
          recursoId: reserva.rows[0].id,
          dadosAntigos: { payment_status: reserva.rows[0].payment_status },
          dadosNovos: { payment_status: internalStatus },
          sucesso: true
        });
      }
      
      await client.query('COMMIT');
      return {
        success: true,
        reservationCode,
        oldStatus: reserva.rows[0].payment_status,
        newStatus: internalStatus
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new ReconciliacaoService();
