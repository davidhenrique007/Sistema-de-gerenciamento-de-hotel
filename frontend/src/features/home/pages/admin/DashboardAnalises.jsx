import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Calendar, Home, Users, Activity, 
  CheckCircle, AlertCircle, DollarSign, RefreshCw
} from 'lucide-react';
import LayoutAdmin from './components/LayoutAdmin';
import styles from './DashboardAnalises.module.css';

const DashboardAnalises = () => {
  const [periodo, setPeriodo] = useState('mes');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    reservasHoje: 0,
    checkinsPendentes: 0,
    pagamentosAtrasados: 0,
    totalReservas: 0,
    receitaTotal: 0,
    receitaPeriodo: 0,
    totalReservasPeriodo: 0
  });
  const [ocupacaoData, setOcupacaoData] = useState([]);
  const [receitaData, setReceitaData] = useState([]);
  const [distribuicaoData, setDistribuicaoData] = useState([]);

  const cores = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6'
  };

  const carregarDados = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      
      // Buscar métricas do dashboard
      const metricsRes = await fetch('http://localhost:5000/api/admin/dashboard/metrics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const metricsData = await metricsRes.json();
      
      if (metricsData.success) {
        setMetrics({
          reservasHoje: metricsData.data.reservasHoje || 0,
          checkinsPendentes: metricsData.data.checkinsPendentes || 0,
          pagamentosAtrasados: metricsData.data.pagamentosAtrasados || 0,
          totalReservas: metricsData.data.reservasMes || 0,
          receitaTotal: metricsData.data.receitaMes || 0,
          receitaPeriodo: metricsData.data.receitaMes || 0,
          totalReservasPeriodo: metricsData.data.reservasMes || 0
        });
      }
      
      // Buscar reservas para gráficos
      const reservasRes = await fetch('http://localhost:5000/api/admin/reservas?limit=500', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const reservasData = await reservasRes.json();
      
      if (reservasData.success && reservasData.data) {
        let reservas = reservasData.data;
        
        // Filtrar por período
        const agora = new Date();
        let dataFiltro = new Date();
        
        switch(periodo) {
          case 'hoje':
            dataFiltro.setHours(0, 0, 0, 0);
            break;
          case 'semana':
            dataFiltro.setDate(agora.getDate() - 7);
            break;
          case 'mes':
            dataFiltro.setMonth(agora.getMonth() - 1);
            break;
          default:
            dataFiltro.setMonth(agora.getMonth() - 1);
        }
        
        const reservasFiltradas = reservas.filter(r => new Date(r.data_checkin) >= dataFiltro);
        
        // Calcular receita e total do período
        const receitaPeriodo = reservasFiltradas.reduce((sum, r) => sum + (parseFloat(r.valor_total) || 0), 0);
        const totalReservasPeriodo = reservasFiltradas.length;
        
        setMetrics(prev => ({
          ...prev,
          receitaPeriodo: receitaPeriodo,
          totalReservasPeriodo: totalReservasPeriodo
        }));
        
        // Processar ocupação por dia (últimos 7 dias)
        const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
        const ocupacaoMap = new Map();
        
        reservasFiltradas.forEach(r => {
          if (r.status_reserva === 'confirmed') {
            const data = new Date(r.data_checkin);
            const diaSemana = diasSemana[data.getDay()];
            ocupacaoMap.set(diaSemana, (ocupacaoMap.get(diaSemana) || 0) + 1);
          }
        });
        
        const ocupacaoArray = diasSemana.map(dia => ({
          dia,
          ocupacao: Math.min(Math.round((ocupacaoMap.get(dia) || 0) * 2.5), 100)
        }));
        
        // Processar receita por mês
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const receitaMap = new Map();
        
        reservas.forEach(r => {
          if (r.status_reserva === 'confirmed' && r.status_pagamento === 'paid') {
            const data = new Date(r.data_checkin);
            const mes = meses[data.getMonth()];
            const valor = parseFloat(r.valor_total) || 0;
            receitaMap.set(mes, (receitaMap.get(mes) || 0) + valor);
          }
        });
        
        const receitaArray = meses.slice(0, 6).map(mes => ({
          mes,
          receita: receitaMap.get(mes) || 0
        }));
        
        // Processar distribuição por tipo de quarto
        const tipoMap = new Map();
        reservas.forEach(r => {
          const tipo = r.quarto_tipo || 'Standard';
          tipoMap.set(tipo, (tipoMap.get(tipo) || 0) + 1);
        });
        
        const totalReservasCount = reservas.length;
        const distribuicaoArray = totalReservasCount > 0 
          ? Array.from(tipoMap.entries()).map(([tipo, count]) => ({
              name: tipo,
              value: Math.round((count / totalReservasCount) * 100)
            }))
          : [{ name: 'Sem dados', value: 100 }];
        
        setOcupacaoData(ocupacaoArray);
        setReceitaData(receitaArray);
        setDistribuicaoData(distribuicaoArray);
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [periodo]);

  const formatCurrency = (value) => {
    return value.toLocaleString('pt-MZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' MTn';
  };

  const MetricCard = ({ title, value, icon: Icon, color }) => (
    <div className={styles.metricCard}>
      <div className={styles.metricIcon} style={{ backgroundColor: color + '15', color: color }}>
        <Icon size={24} />
      </div>
      <div className={styles.metricContent}>
        <h3 className={styles.metricValue}>{typeof value === 'number' ? value : value}</h3>
        <p className={styles.metricTitle}>{title}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <LayoutAdmin>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Carregando análises...</p>
        </div>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Análises e Métricas</h1>
            <p className={styles.subtitle}>Visualize dados detalhados do hotel e tome decisões estratégicas</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.periodSelector}>
              <button onClick={() => setPeriodo('hoje')} className={`${styles.periodBtn} ${periodo === 'hoje' ? styles.active : ''}`}>Hoje</button>
              <button onClick={() => setPeriodo('semana')} className={`${styles.periodBtn} ${periodo === 'semana' ? styles.active : ''}`}>Semana</button>
              <button onClick={() => setPeriodo('mes')} className={`${styles.periodBtn} ${periodo === 'mes' ? styles.active : ''}`}>Mês</button>
            </div>
            <button onClick={carregarDados} className={styles.refreshBtn}>
              <RefreshCw size={16} /> Atualizar
            </button>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className={styles.metricsGrid}>
          <MetricCard title="Reservas Hoje" value={metrics.reservasHoje} icon={Calendar} color={cores.primary} />
          <MetricCard title="Check-ins Pendentes" value={metrics.checkinsPendentes} icon={Users} color={cores.warning} />
          <MetricCard title="Pagamentos Atrasados" value={metrics.pagamentosAtrasados} icon={AlertCircle} color={cores.danger} />
          <MetricCard title="Reservas no Período" value={metrics.totalReservasPeriodo} icon={CheckCircle} color={cores.success} />
          <MetricCard title="Receita no Período" value={formatCurrency(metrics.receitaPeriodo)} icon={DollarSign} color={cores.purple} />
        </div>

        {/* Gráficos */}
        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>📊 Taxa de Ocupação</h3>
            <p className={styles.chartSubtitle}>Período selecionado: {periodo === 'hoje' ? 'Hoje' : periodo === 'semana' ? 'Últimos 7 dias' : 'Último mês'}</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ocupacaoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="dia" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Ocupação']} />
                <Bar dataKey="ocupacao" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>💰 Receita Mensal</h3>
            <p className={styles.chartSubtitle}>Comparativo de receita por período</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={receitaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mes" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>🥧 Distribuição por Tipo de Quarto</h3>
            <p className={styles.chartSubtitle}>Reservas por categoria</p>
            <div className={styles.pieWrapper}>
              <ResponsiveContainer width="60%" height={220}>
                <PieChart>
                  <Pie
                    data={distribuicaoData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                  >
                    {distribuicaoData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={cores.primary} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.pieLegend}>
                {distribuicaoData.map((item, idx) => (
                  <div key={idx} className={styles.legendItem}>
                    <span className={styles.legendColor} style={{ backgroundColor: cores.primary }}></span>
                    <span>{item.name}</span>
                    <span className={styles.legendValue}>{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.quickMenuCard}>
            <h3>⚡ Ações Rápidas</h3>
            <div className={styles.quickMenu}>
              <button className={styles.menuItem} onClick={() => window.location.href = '/admin/dashboard'}>📊 Dashboard</button>
              <button className={styles.menuItem} onClick={() => window.location.href = '/admin/reservas'}>📅 Reservas</button>
              <button className={styles.menuItem} onClick={() => window.location.href = '/admin/pagamentos'}>💰 Pagamentos</button>
              <button className={styles.menuItem} onClick={() => window.location.href = '/admin/auditoria'}>📋 Auditoria</button>
              <button className={styles.menuItem} onClick={() => window.location.href = '/admin/relatorios'}>📊 Relatórios</button>
            </div>
          </div>
        </div>
      </div>
    </LayoutAdmin>
  );
};

export default DashboardAnalises;
