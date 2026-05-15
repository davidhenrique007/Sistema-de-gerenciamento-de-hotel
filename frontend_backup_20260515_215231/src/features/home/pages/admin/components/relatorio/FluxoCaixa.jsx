// frontend/src/features/home/pages/admin/components/relatorio/FluxoCaixa.jsx
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import './FluxoCaixa.css';

const FluxoCaixa = ({ filtros }) => {
  const [loading, setLoading] = useState(true);
  const [cashflow, setCashflow] = useState([]);
  const [summary, setSummary] = useState({
    totalProjetado: 0,
    mediaDiaria: 0,
    picoDiario: 0,
    saldoFinal: 0
  });

  const carregarFluxoCaixa = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:5000/api/admin/financeiro/cashflow', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setCashflow(data.data);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Erro ao carregar fluxo de caixa:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFluxoCaixa();
  }, [filtros]);

  const formatCurrency = (value) => {
    return value.toLocaleString('pt-MZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' MTn';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="customTooltip">
          <p className="tooltipLabel">{label}</p>
          <p className="tooltipValue entrada">💰 Entrada: {formatCurrency(payload[0]?.value)}</p>
          <p className="tooltipValue saldo">💵 Saldo: {formatCurrency(payload[2]?.value)}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="skeletonFluxo"><div className="skeletonLine"></div></div>;
  }

  return (
    <div className="fluxoCaixa">
      <div className="fluxoHeader">
        <h3>💵 Fluxo de Caixa Projetado - Próximos 30 Dias</h3>
      </div>

      <div className="statsRow">
        <div className="statCard">
          <div className="statIcon"><DollarSign size={20} /></div>
          <div className="statInfo">
            <span className="statValue">{formatCurrency(summary.totalProjetado)}</span>
            <span className="statLabel">Entrada Total Projetada</span>
          </div>
        </div>
        <div className="statCard">
          <div className="statIcon"><Calendar size={20} /></div>
          <div className="statInfo">
            <span className="statValue">{formatCurrency(summary.mediaDiaria)}</span>
            <span className="statLabel">Média Diária</span>
          </div>
        </div>
        <div className="statCard">
          <div className="statIcon"><TrendingUp size={20} /></div>
          <div className="statInfo">
            <span className="statValue">{formatCurrency(summary.picoDiario)}</span>
            <span className="statLabel">Pico Diário</span>
          </div>
        </div>
        <div className="statCard">
          <div className="statIcon"><DollarSign size={20} /></div>
          <div className="statInfo">
            <span className="statValue">{formatCurrency(summary.saldoFinal)}</span>
            <span className="statLabel">Saldo Projetado</span>
          </div>
        </div>
      </div>

      <div className="chartCard">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={cashflow}>
            <defs>
              <linearGradient id="colorEntrada" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="data" stroke="#64748b" fontSize={11} interval={5} />
            <YAxis yAxisId="left" stroke="#10b981" fontSize={11} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
            <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={11} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area yAxisId="left" type="monotone" dataKey="entrada" stroke="#10b981" fill="url(#colorEntrada)" name="Entrada" />
            <Area yAxisId="right" type="monotone" dataKey="saldo" stroke="#3b82f6" fill="url(#colorSaldo)" name="Saldo Acumulado" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="infoCard">
        <AlertCircle size={18} />
        <div className="infoContent">
          <strong>Informações da Projeção</strong>
          <p>O fluxo de caixa projetado considera reservas confirmadas com pagamento confirmado (100%) e pendente (70% de probabilidade). Os valores são atualizados automaticamente conforme novas reservas são realizadas.</p>
        </div>
      </div>
    </div>
  );
};

export default FluxoCaixa;