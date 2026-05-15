// frontend/src/features/home/pages/admin/components/relatorio/RelatorioOcupacao.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, Calendar, Home, Award } from 'lucide-react';
import './RelatorioOcupacao.css';

const RelatorioOcupacao = ({ filtros }) => {
  const [loading, setLoading] = useState(true);
  const [ocupacaoDiaria, setOcupacaoDiaria] = useState([]);
  const [ocupacaoPorTipo, setOcupacaoPorTipo] = useState([]);
  const [ocupacaoPorAndar, setOcupacaoPorAndar] = useState([]);
  const [stats, setStats] = useState({
    media: 0,
    pico: 0,
    menor: 0,
    totalQuartos: 43,
    ocupadosAtuais: 0
  });
  const [tipoGrafico, setTipoGrafico] = useState('area');

  const cores = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const carregarDados = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      
      // Buscar reservas
      const response = await fetch('http://localhost:5000/api/admin/reservas?limit=500', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      let reservas = data.success && data.data ? data.data : [];
      
      // Filtrar por período
      const agora = new Date();
      let dataFiltro = new Date();
      if (filtros?.periodo === 'semana') {
        dataFiltro.setDate(agora.getDate() - 7);
      } else if (filtros?.periodo === 'mes') {
        dataFiltro.setMonth(agora.getMonth() - 1);
      } else {
        dataFiltro.setMonth(agora.getMonth() - 1);
      }
      
      const reservasFiltradas = reservas.filter(r => new Date(r.data_checkin) >= dataFiltro && r.status_reserva === 'confirmed');
      
      // Ocupação diária (últimos 30 dias)
      const ocupacaoMap = new Map();
      for (let i = 29; i >= 0; i--) {
        const data = new Date();
        data.setDate(data.getDate() - i);
        const dataStr = `${data.getDate()}/${data.getMonth() + 1}`;
        ocupacaoMap.set(dataStr, 0);
      }
      
      reservasFiltradas.forEach(r => {
        const data = new Date(r.data_checkin);
        const dataStr = `${data.getDate()}/${data.getMonth() + 1}`;
        ocupacaoMap.set(dataStr, (ocupacaoMap.get(dataStr) || 0) + 1);
      });
      
      const ocupacaoArray = Array.from(ocupacaoMap.entries()).map(([data, count]) => ({
        data,
        ocupacao: Math.min(Math.round((count / stats.totalQuartos) * 100), 100)
      }));
      
      // Ocupação por tipo de quarto
      const tipoMap = new Map();
      reservasFiltradas.forEach(r => {
        const tipo = r.quarto_tipo || 'Standard';
        tipoMap.set(tipo, (tipoMap.get(tipo) || 0) + 1);
      });
      
      const tipoArray = Array.from(tipoMap.entries()).map(([tipo, count]) => ({
        tipo,
        reservas: count,
        ocupacao: Math.min(Math.round((count / stats.totalQuartos) * 100), 100)
      }));
      
      // Ocupação por andar
      const andarMap = new Map();
      reservasFiltradas.forEach(r => {
        const andar = r.quarto_andar || 1;
        andarMap.set(andar, (andarMap.get(andar) || 0) + 1);
      });
      
      const andarArray = Array.from(andarMap.entries())
        .map(([andar, count]) => ({
          andar: `${andar}º`,
          ocupacao: Math.min(Math.round((count / (stats.totalQuartos / 4)) * 100), 100)
        }))
        .sort((a, b) => parseInt(a.andar) - parseInt(b.andar));
      
      const media = ocupacaoArray.reduce((sum, d) => sum + d.ocupacao, 0) / ocupacaoArray.length;
      const pico = Math.max(...ocupacaoArray.map(d => d.ocupacao));
      const menor = Math.min(...ocupacaoArray.filter(d => d.ocupacao > 0).map(d => d.ocupacao));
      
      setOcupacaoDiaria(ocupacaoArray);
      setOcupacaoPorTipo(tipoArray);
      setOcupacaoPorAndar(andarArray);
      setStats(prev => ({
        ...prev,
        media: Math.round(media),
        pico,
        menor: menor || 0,
        ocupadosAtuais: reservasFiltradas.filter(r => new Date(r.data_checkin) <= new Date()).length
      }));
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [filtros]);

  if (loading) {
    return <div className="skeletonOcupacao"><div className="skeletonLine"></div></div>;
  }

  return (
    <div className="relatorioOcupacao">
      <div className="statsRow">
        <div className="statCard">
          <div className="statIcon"><Activity size={20} /></div>
          <div className="statInfo">
            <span className="statValue">{stats.media}%</span>
            <span className="statLabel">Média de Ocupação</span>
          </div>
        </div>
        <div className="statCard">
          <div className="statIcon"><TrendingUp size={20} /></div>
          <div className="statInfo">
            <span className="statValue">{stats.pico}%</span>
            <span className="statLabel">Pico de Ocupação</span>
          </div>
        </div>
        <div className="statCard">
          <div className="statIcon"><TrendingDown size={20} /></div>
          <div className="statInfo">
            <span className="statValue">{stats.menor}%</span>
            <span className="statLabel">Menor Ocupação</span>
          </div>
        </div>
        <div className="statCard">
          <div className="statIcon"><Home size={20} /></div>
          <div className="statInfo">
            <span className="statValue">{stats.ocupadosAtuais}/{stats.totalQuartos}</span>
            <span className="statLabel">Quartos Ocupados</span>
          </div>
        </div>
      </div>

      <div className="chartCard">
        <div className="chartHeader">
          <h3>📈 Ocupação Diária</h3>
          <div className="chartTypeSelector">
            <button onClick={() => setTipoGrafico('area')} className={tipoGrafico === 'area' ? 'active' : ''}>Área</button>
            <button onClick={() => setTipoGrafico('line')} className={tipoGrafico === 'line' ? 'active' : ''}>Linha</button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          {tipoGrafico === 'area' ? (
            <AreaChart data={ocupacaoDiaria}>
              <defs>
                <linearGradient id="colorOcupacao" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="data" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, 'Ocupação']} />
              <Area type="monotone" dataKey="ocupacao" stroke="#3b82f6" fill="url(#colorOcupacao)" />
            </AreaChart>
          ) : (
            <LineChart data={ocupacaoDiaria}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="data" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, 'Ocupação']} />
              <Line type="monotone" dataKey="ocupacao" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="chartsRow">
        <div className="chartCard">
          <h3>🏨 Ocupação por Tipo de Quarto</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ocupacaoPorTipo} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="tipo" stroke="#64748b" fontSize={11} width={100} />
              <Tooltip formatter={(value) => [`${value}%`, 'Ocupação']} />
              <Bar dataKey="ocupacao" fill="#10b981" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chartCard">
          <h3>🏢 Ocupação por Andar</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ocupacaoPorAndar}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="andar" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(value) => [`${value}%`, 'Ocupação']} />
              <Bar dataKey="ocupacao" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RelatorioOcupacao;