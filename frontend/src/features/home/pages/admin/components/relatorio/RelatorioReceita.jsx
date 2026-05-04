import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, ComposedChart
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Wallet } from 'lucide-react';
import './RelatorioReceita.css';

const RelatorioReceita = ({ filtros }) => {
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState([]);
  const [metricas, setMetricas] = useState({
    totalReceita: 0,
    mediaDiaria: 0,
    ticketMedio: 0,
    variacao: 0
  });
  const [tipoGrafico, setTipoGrafico] = useState('line');

  const carregarDados = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const params = new URLSearchParams(filtros);
      const response = await fetch(`http://localhost:5000/api/admin/relatorios/receita?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();

      if (result.success) {
        const dadosFormatados = result.data.map(item => ({
          periodo: item.data || item.mes,
          receita: parseFloat(item.receita),
          quantidade: parseInt(item.quantidade),
          ticketMedio: parseFloat(item.ticket_medio)
        }));
        setDados(dadosFormatados);

        const totalReceita = dadosFormatados.reduce((sum, d) => sum + d.receita, 0);
        const totalReservas = dadosFormatados.reduce((sum, d) => sum + d.quantidade, 0);
        const mediaDiaria = dadosFormatados.length > 0 ? totalReceita / dadosFormatados.length : 0;
        const ticketMedio = totalReservas > 0 ? totalReceita / totalReservas : 0;

        setMetricas({ totalReceita, mediaDiaria, ticketMedio, variacao: 0 });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
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

  if (loading) {
    return <div className="skeletonChart"><div className="skeletonLine"></div></div>;
  }

  return (
    <div className="receitaContainer">
      <div className="receitaHeader">
        <h3>💰 Receita por Período</h3>
        <div className="chartTypeSelector">
          <button onClick={() => setTipoGrafico('line')} className={tipoGrafico === 'line' ? 'active' : ''}>Linha</button>
          <button onClick={() => setTipoGrafico('bar')} className={tipoGrafico === 'bar' ? 'active' : ''}>Barras</button>
        </div>
      </div>

      <div className="metricasRow">
        <div className="metricaCard">
          <div className="metricaIcon"><DollarSign size={20} /></div>
          <div className="metricaInfo">
            <span className="metricaValor">{formatCurrency(metricas.totalReceita)}</span>
            <span className="metricaLabel">Receita Total</span>
          </div>
        </div>
        <div className="metricaCard">
          <div className="metricaIcon"><Calendar size={20} /></div>
          <div className="metricaInfo">
            <span className="metricaValor">{formatCurrency(metricas.mediaDiaria)}</span>
            <span className="metricaLabel">Média Diária</span>
          </div>
        </div>
        <div className="metricaCard">
          <div className="metricaIcon"><Wallet size={20} /></div>
          <div className="metricaInfo">
            <span className="metricaValor">{formatCurrency(metricas.ticketMedio)}</span>
            <span className="metricaLabel">Ticket Médio</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        {tipoGrafico === 'line' ? (
          <ComposedChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="periodo" stroke="#64748b" />
            <YAxis yAxisId="left" stroke="#3b82f6" tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
            <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Area yAxisId="left" type="monotone" dataKey="receita" fill="#3b82f6" fillOpacity={0.1} stroke="#3b82f6" />
            <Line yAxisId="right" type="monotone" dataKey="ticketMedio" stroke="#10b981" strokeDasharray="5 5" />
          </ComposedChart>
        ) : (
          <BarChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="periodo" stroke="#64748b" />
            <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Bar dataKey="receita" fill="#3b82f6" radius={[8,8,0,0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default RelatorioReceita;
