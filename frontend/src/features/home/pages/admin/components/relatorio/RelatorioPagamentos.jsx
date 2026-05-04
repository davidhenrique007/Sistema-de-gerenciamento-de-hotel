// frontend/src/features/home/pages/admin/components/relatorio/RelatorioPagamentos.jsx
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, CreditCard, Smartphone, Coins, Calendar } from 'lucide-react';
import './RelatorioPagamentos.css';

const RelatorioPagamentos = ({ filtros }) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    pendingPayments: 0,
    totalPendingReservations: 0,
    badDebt: 0,
    badDebtRate: 0,
    cancellationRate: 0,
    cancellationLoss: 0,
    totalRevenue: 0,
    projectedRevenue: 0,
    dominantMethod: null
  });
  const [paymentMethods, setPaymentMethods] = useState({
    cash: { valor: 0, percentual: 0, quantidade: 0 },
    mpesa: { valor: 0, percentual: 0, quantidade: 0 },
    card: { valor: 0, percentual: 0, quantidade: 0 },
    outros: { valor: 0, percentual: 0, quantidade: 0 }
  });

  const cores = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

  const carregarDados = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:5000/api/admin/financeiro/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setSummary(data.summary);
        setPaymentMethods(data.paymentMethods);
      }
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [filtros]);

  const formatCurrency = (value) => {
    return value.toLocaleString('pt-MZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' MTn';
  };

  const methodsData = [
    { name: 'Dinheiro', valor: paymentMethods.cash.valor, percentual: paymentMethods.cash.percentual, quantidade: paymentMethods.cash.quantidade, icon: <Coins size={16} /> },
    { name: 'M-Pesa', valor: paymentMethods.mpesa.valor, percentual: paymentMethods.mpesa.percentual, quantidade: paymentMethods.mpesa.quantidade, icon: <Smartphone size={16} /> },
    { name: 'Cartão', valor: paymentMethods.card.valor, percentual: paymentMethods.card.percentual, quantidade: paymentMethods.card.quantidade, icon: <CreditCard size={16} /> }
  ].filter(m => m.valor > 0 || m.quantidade > 0);

  const pieData = methodsData.map(m => ({ name: m.name, value: m.percentual }));

  if (loading) {
    return <div className="skeletonFinanceiro"><div className="skeletonLine"></div></div>;
  }

  return (
    <div className="relatorioPagamentos">
      {/* Cards de Métricas */}
      <div className="metricsGrid">
        <div className="metricCard">
          <div className="metricIcon pending"><DollarSign size={24} /></div>
          <div className="metricInfo">
            <span className="metricValue">{formatCurrency(summary.pendingPayments)}</span>
            <span className="metricLabel">Pagamentos Pendentes</span>
            <span className="metricSub">{summary.totalPendingReservations} reservas</span>
          </div>
        </div>
        
        <div className="metricCard">
          <div className="metricIcon risk"><AlertTriangle size={24} /></div>
          <div className="metricInfo">
            <span className="metricValue">{summary.badDebtRate}%</span>
            <span className="metricLabel">Inadimplência</span>
            <span className="metricSub">Perda: {formatCurrency(summary.badDebt)}</span>
          </div>
        </div>
        
        <div className="metricCard">
          <div className="metricIcon cancel"><TrendingDown size={24} /></div>
          <div className="metricInfo">
            <span className="metricValue">{summary.cancellationRate}%</span>
            <span className="metricLabel">Cancelamentos</span>
            <span className="metricSub">Perda: {formatCurrency(summary.cancellationLoss)}</span>
          </div>
        </div>
        
        <div className="metricCard">
          <div className="metricIcon revenue"><TrendingUp size={24} /></div>
          <div className="metricInfo">
            <span className="metricValue">{formatCurrency(summary.projectedRevenue)}</span>
            <span className="metricLabel">Receita Projetada</span>
            <span className="metricSub">Realizada: {formatCurrency(summary.totalRevenue)}</span>
          </div>
        </div>
      </div>

      {/* Método de Pagamento Dominante */}
      {summary.dominantMethod && (
        <div className="dominantCard">
          <div className="dominantIcon">🏆</div>
          <div className="dominantInfo">
            <span className="dominantLabel">Método de Pagamento Dominante</span>
            <span className="dominantName">{summary.dominantMethod.name}</span>
            <span className="dominantValue">{summary.dominantMethod.percentage.toFixed(1)}% das transações</span>
          </div>
        </div>
      )}

      {/* Gráficos de Pagamentos */}
      <div className="chartsRow">
        <div className="chartCard">
          <h3>💰 Distribuição por Método de Pagamento</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={cores[idx % cores.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="emptyChart">Nenhum dado de pagamento disponível</div>
          )}
        </div>

        <div className="chartCard">
          <h3>📊 Comparativo por Método</h3>
          {methodsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={methodsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="valor" fill="#3b82f6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="emptyChart">Nenhum dado disponível</div>
          )}
        </div>
      </div>

      {/* Tabela de Detalhes */}
      <div className="detailsTable">
        <h3>📋 Detalhes por Método de Pagamento</h3>
        <table>
          <thead>
            <tr>
              <th>Método</th>
              <th>Valor Total</th>
              <th>Percentual</th>
              <th>Quantidade</th>
              <th>Ticket Médio</th>
            </tr>
          </thead>
          <tbody>
            {methodsData.map((m, idx) => (
              <tr key={idx}>
                <td><span className="methodIcon">{m.icon}</span> {m.name}</td>
                <td className="valor">{formatCurrency(m.valor)}</td>
                <td>{m.percentual.toFixed(1)}%</td>
                <td>{m.quantidade}</td>
                <td>{m.quantidade > 0 ? formatCurrency(m.valor / m.quantidade) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RelatorioPagamentos;