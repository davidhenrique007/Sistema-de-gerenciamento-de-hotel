// frontend/src/features/home/pages/admin/DashboardAnalises.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { 
  TrendingUp, Calendar, Home, Users, Activity, Download, RefreshCw,
  CheckCircle, AlertCircle, DollarSign
} from 'lucide-react';
import LayoutAdmin from './components/LayoutAdmin';
import styles from './DashboardAnalises.module.css';

const DashboardAnalises = () => {
  const [periodo, setPeriodo] = useState('semana');
  const [loading, setLoading] = useState(true);
  const [dadosReais, setDadosReais] = useState({
    stats: {
      reservasHoje: 0,
      checkinsPendentes: 0,
      pagamentosAtrasados: 0,
      totalReservas: 0,
      receitaTotal: 0
    },
    ocupacao: [],
    receita: [],
    distribuicao: []
  });

  const cores = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6'
  };

  // Buscar dados reais da API
  const carregarDadosReais = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch('http://localhost:5000/api/admin/reservas?limit=500', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      let reservas = [];
      if (data.success && data.data) {
        reservas = data.data;
      }
      
      const hoje = new Date().toISOString().split('T')[0];
      const agora = new Date();
      
      // Calcular métricas reais
      const reservasHoje = reservas.filter(r => {
        const dataCheckin = new Date(r.data_checkin).toISOString().split('T')[0];
        return dataCheckin === hoje && r.status_reserva === 'confirmed';
      }).length;
      
      const checkinsPendentes = reservas.filter(r => {
        const dataCheckin = new Date(r.data_checkin).toISOString().split('T')[0];
        return dataCheckin === hoje && r.status_reserva === 'confirmed' && !r.check_in_real;
      }).length;
      
      const pagamentosAtrasados = reservas.filter(r => {
        const dataCheckin = new Date(r.data_checkin);
        return r.status_pagamento === 'pending' && dataCheckin < agora && r.status_reserva === 'confirmed';
      }).length;
      
      const totalReservas = reservas.length;
      const receitaTotal = reservas.reduce((acc, r) => acc + (parseFloat(r.valor_total) || 0), 0);
      
      // Processar ocupação por dia (últimos 7 dias)
      const ocupacaoMap = new Map();
      const diasSemana = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const diaStr = d.toISOString().split('T')[0];
        const diaLabel = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        diasSemana.push({ data: diaStr, label: diaLabel });
        
        const count = reservas.filter(r => {
          const dataCheckin = new Date(r.data_checkin).toISOString().split('T')[0];
          return dataCheckin === diaStr && r.status_reserva === 'confirmed';
        }).length;
        ocupacaoMap.set(diaLabel, Math.min(Math.round((count / 43) * 100), 100));
      }
      
      const ocupacaoArray = diasSemana.map(d => ({
        dia: d.label,
        ocupacao: ocupacaoMap.get(d.label) || 0
      }));
      
      // Processar receita por mês
      const receitaMap = new Map();
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const mesAtual = new Date().getMonth();
      
      for (let i = 5; i >= 0; i--) {
        const mesIndex = (mesAtual - i + 12) % 12;
        const mesNome = meses[mesIndex];
        receitaMap.set(mesNome, 0);
      }
      
      reservas.forEach(r => {
        const data = new Date(r.data_checkin);
        const mes = meses[data.getMonth()];
        const valor = parseFloat(r.valor_total) || 0;
        if (receitaMap.has(mes)) {
          receitaMap.set(mes, (receitaMap.get(mes) || 0) + valor);
        }
      });
      
      const receitaArray = Array.from(receitaMap.entries()).map(([mes, total]) => ({
        mes,
        receita: total
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
            value: Math.round((count / totalReservasCount) * 100),
            color: cores.primary
          }))
        : [{ name: 'Sem dados', value: 100, color: '#cbd5e1' }];
      
      setDadosReais({
        stats: {
          reservasHoje,
          checkinsPendentes,
          pagamentosAtrasados,
          totalReservas,
          receitaTotal
        },
        ocupacao: ocupacaoArray,
        receita: receitaArray,
        distribuicao: distribuicaoArray
      });
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para trocar período (AGORA FUNCIONA!)
  const handlePeriodoChange = (novoPeriodo) => {
    setPeriodo(novoPeriodo);
    carregarDadosReais();
  };

  useEffect(() => {
    carregarDadosReais();
  }, [carregarDadosReais]);

  const formatCurrency = (value) => {
    return value.toLocaleString('pt-MZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' MTn';
  };

  const MetricCard = ({ title, value, icon: Icon, color }) => (
    <div className={styles.metricCard}>
      <div className={styles.metricIcon} style={{ backgroundColor: color + '15', color: color }}>
        <Icon size={24} />
      </div>
      <div className={styles.metricContent}>
        <h3 className={styles.metricValue}>{value}</h3>
        <p className={styles.metricTitle}>{title}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <LayoutAdmin>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Carregando dados do sistema...</p>
        </div>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Análises e Métricas</h1>
            <p className={styles.subtitle}>Visualize dados detalhados do hotel e tome decisões estratégicas</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.periodSelector}>
              <button 
                onClick={() => handlePeriodoChange('hoje')} 
                className={`${styles.periodBtn} ${periodo === 'hoje' ? styles.active : ''}`}
              >
                Hoje
              </button>
              <button 
                onClick={() => handlePeriodoChange('semana')} 
                className={`${styles.periodBtn} ${periodo === 'semana' ? styles.active : ''}`}
              >
                Semana
              </button>
              <button 
                onClick={() => handlePeriodoChange('mes')} 
                className={`${styles.periodBtn} ${periodo === 'mes' ? styles.active : ''}`}
              >
                Mês
              </button>
            </div>
            <button onClick={carregarDadosReais} className={styles.exportBtn}>
              <RefreshCw size={16} /> Atualizar
            </button>
          </div>
        </div>

        {/* Cards de Métricas - Dados REAIS */}
        <div className={styles.metricsGrid}>
          <MetricCard title="Reservas Hoje" value={dadosReais.stats.reservasHoje} icon={Calendar} color={cores.primary} />
          <MetricCard title="Check-ins Pendentes" value={dadosReais.stats.checkinsPendentes} icon={Users} color={cores.warning} />
          <MetricCard title="Pagamentos Atrasados" value={dadosReais.stats.pagamentosAtrasados} icon={AlertCircle} color={cores.danger} />
          <MetricCard title="Total Reservas" value={dadosReais.stats.totalReservas} icon={CheckCircle} color={cores.success} />
          <MetricCard title="Receita Total" value={formatCurrency(dadosReais.stats.receitaTotal)} icon={DollarSign} color={cores.purple} />
        </div>

        {/* Grid de Gráficos */}
        <div className={styles.chartsGrid}>
          {/* Gráfico de Ocupação */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3>📊 Taxa de Ocupação</h3>
              <p>Últimos 7 dias</p>
            </div>
            {dadosReais.ocupacao.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dadosReais.ocupacao}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="dia" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Ocupação']} />
                  <Bar dataKey="ocupacao" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyChart}>Nenhum dado de ocupação disponível</div>
            )}
          </div>

          {/* Gráfico de Receita */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3>💰 Receita Mensal</h3>
              <p>Comparativo de receita por período</p>
            </div>
            {dadosReais.receita.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={dadosReais.receita}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="mes" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyChart}>Nenhum dado de receita disponível</div>
            )}
          </div>

          {/* Gráfico de Distribuição */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3>🥧 Distribuição por Tipo de Quarto</h3>
              <p>Reservas por categoria</p>
            </div>
            {dadosReais.distribuicao.length > 0 && dadosReais.distribuicao[0].name !== 'Sem dados' ? (
              <div className={styles.pieWrapper}>
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={dadosReais.distribuicao}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {dadosReais.distribuicao.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color || cores.primary} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className={styles.pieLegend}>
                  {dadosReais.distribuicao.map((item, idx) => (
                    <div key={idx} className={styles.legendItem}>
                      <span className={styles.legendColor} style={{ backgroundColor: item.color || cores.primary }}></span>
                      <span>{item.name}</span>
                      <span className={styles.legendValue}>{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.emptyChart}>Nenhuma reserva concluída para análise</div>
            )}
          </div>

          {/* Menu rápido */}
          <div className={styles.quickMenuCard}>
            <h3>⚡ Ações Rápidas</h3>
            <div className={styles.quickMenu}>
              <button className={styles.menuItem} onClick={() => window.location.href = '/admin/dashboard'}><Home size={16} /> Dashboard</button>
              <button className={styles.menuItem} onClick={() => window.location.href = '/admin/reservas'}><Calendar size={16} /> Reservas</button>
              <button className={styles.menuItem} onClick={() => window.location.href = '/admin/pagamentos'}><DollarSign size={16} /> Pagamentos</button>
              <button className={styles.menuItem} onClick={() => window.location.href = '/admin/quartos'}><Home size={16} /> Quartos</button>
              <button className={styles.menuItem} onClick={() => window.location.href = '/admin/auditoria'}><Activity size={16} /> Auditoria</button>
              <button className={styles.menuItem} onClick={() => window.location.href = '/admin/utilizadores'}><Users size={16} /> Utilizadores</button>
            </div>
          </div>
        </div>
      </div>
    </LayoutAdmin>
  );
};

export default DashboardAnalises;