// frontend/src/features/home/pages/admin/components/grafico/GraficoPizza.jsx
import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import api from '@services/api';
import styles from './GraficoPizza.module.css';

const GraficoPizza = ({ dataInicio, dataFim }) => {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalReservas, setTotalReservas] = useState(0);

  const cores = {
    standard: '#3b82f6',
    deluxe: '#10b981',
    suite: '#f59e0b',
    family: '#8b5cf6',
    default: '#6c757d'
  };

  const labels = {
    standard: 'Standard',
    deluxe: 'Deluxe',
    suite: 'Suíte',
    family: 'Família'
  };

  useEffect(() => {
    carregarDados();
  }, [dataInicio, dataFim]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/dashboard/distribuicao-quartos', {
        params: { inicio: dataInicio, fim: dataFim }
      });
      
      if (response.data.success) {
        const dadosFormatados = response.data.data.map(item => ({
          name: labels[item.tipo] || item.tipo,
          value: parseInt(item.total),
          tipo: item.tipo,
          percentual: item.percentual
        }));
        setDados(dadosFormatados);
        
        const total = dadosFormatados.reduce((acc, curr) => acc + curr.value, 0);
        setTotalReservas(total);
      }
    } catch (error) {
      console.error('Erro ao carregar distribuição:', error);
      setDados([]);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipType}>{data.name}</p>
          <p className={styles.tooltipValue}>
            Reservas: <strong>{data.value}</strong>
          </p>
          <p className={styles.tooltipPercent}>
            Percentual: <strong>{data.percentual}%</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className={styles.legend}>
        {payload.map((entry, index) => (
          <div key={`legend-${index}`} className={styles.legendItem}>
            <div 
              className={styles.legendColor}
              style={{ backgroundColor: entry.color }}
            />
            <span className={styles.legendLabel}>{entry.value}</span>
            <span className={styles.legendValue}>
              {dados.find(d => d.name === entry.value)?.value} reservas
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Carregando distribuição...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Distribuição por Tipo de Quarto</h3>
          <p className={styles.subtitle}>Reservas por categoria</p>
        </div>
        <div className={styles.totalInfo}>
          <span className={styles.totalLabel}>Total de Reservas</span>
          <span className={styles.totalValue}>{totalReservas}</span>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={dados}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              animationDuration={1000}
              labelLine={false}
            >
              {dados.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={cores[entry.tipo] || cores.default}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GraficoPizza;