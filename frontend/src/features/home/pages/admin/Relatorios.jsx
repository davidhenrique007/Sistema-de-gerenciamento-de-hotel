// frontend/src/features/home/pages/admin/Relatorios.jsx
import React, { useState, useEffect } from 'react';
import LayoutAdmin from './components/LayoutAdmin';
import RelatorioReceita from './components/relatorio/RelatorioReceita';
import ComparativoPeriodo from './components/relatorio/ComparativoPeriodo';
import { Calendar, DollarSign, TrendingUp, BarChart3, Download, RefreshCw } from 'lucide-react';
import './Relatorios.css';

const Relatorios = () => {
  const [activeTab, setActiveTab] = useState('receita');
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    previousStartDate: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString().split('T')[0],
    previousEndDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    roomType: 'todos',
    paymentMethod: 'todos',
    groupBy: 'month'
  });

  const tabs = [
    { id: 'receita', label: '💰 Receita', icon: DollarSign },
    { id: 'comparativo', label: '📊 Comparativo', icon: TrendingUp },
    { id: 'tendencia', label: '📈 Tendência', icon: BarChart3 }
  ];

  const handleFiltroChange = (key, value) => {
    setFiltros(prev => ({ ...prev, [key]: value }));
  };

  const handleAplicarFiltros = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <LayoutAdmin>
      <div className="relatoriosContainer">
        <div className="header">
          <h1 className="title">Relatórios Financeiros</h1>
          <p className="subtitle">Análise completa de receita, tendências e projeções financeiras</p>
        </div>

        {/* Filtros */}
        <div className="filtersCard">
          <div className="filtersTitle">
            <Calendar size={16} /> Filtros Avançados
          </div>
          <div className="filtersGrid">
            <div className="filterGroup">
              <label>Data Início</label>
              <input type="date" value={filtros.startDate} onChange={(e) => handleFiltroChange('startDate', e.target.value)} className="filterInput" />
            </div>
            <div className="filterGroup">
              <label>Data Fim</label>
              <input type="date" value={filtros.endDate} onChange={(e) => handleFiltroChange('endDate', e.target.value)} className="filterInput" />
            </div>
            <div className="filterGroup">
              <label>Tipo de Quarto</label>
              <select value={filtros.roomType} onChange={(e) => handleFiltroChange('roomType', e.target.value)} className="filterSelect">
                <option value="todos">Todos</option>
                <option value="standard">Standard</option>
                <option value="deluxe">Deluxe</option>
                <option value="suite">Suite</option>
                <option value="presidencial">Presidencial</option>
              </select>
            </div>
            <div className="filterGroup">
              <label>Método de Pagamento</label>
              <select value={filtros.paymentMethod} onChange={(e) => handleFiltroChange('paymentMethod', e.target.value)} className="filterSelect">
                <option value="todos">Todos</option>
                <option value="mpesa">M-Pesa</option>
                <option value="cartao">Cartão</option>
                <option value="dinheiro">Dinheiro</option>
              </select>
            </div>
            <div className="filterGroup">
              <label>Agregação</label>
              <select value={filtros.groupBy} onChange={(e) => handleFiltroChange('groupBy', e.target.value)} className="filterSelect">
                <option value="day">Diário</option>
                <option value="week">Semanal</option>
                <option value="month">Mensal</option>
                <option value="year">Anual</option>
              </select>
            </div>
            <div className="filterActions">
              <button onClick={handleAplicarFiltros}>Aplicar Filtros</button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabsNav">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tabBtn ${activeTab === tab.id ? 'active' : ''}`}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        {activeTab === 'receita' && <RelatorioReceita filtros={filtros} />}
        {activeTab === 'comparativo' && <ComparativoPeriodo filtros={filtros} />}
        {activeTab === 'tendencia' && (
          <div className="chartCard">
            <div className="chartHeader">
              <h3>📈 Tendência e Projeção</h3>
              <p>Previsão para os próximos períodos baseada em tendência histórica</p>
            </div>
            <div className="emptyState">
              <p>Funcionalidade em desenvolvimento - Próxima atualização</p>
            </div>
          </div>
        )}
      </div>
    </LayoutAdmin>
  );
};

export default Relatorios;