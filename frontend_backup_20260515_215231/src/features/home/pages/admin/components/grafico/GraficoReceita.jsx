// frontend/src/features/home/pages/admin/components/grafico/GraficoReceita.jsx
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import api from '@services/api';
import styles from './GraficoReceita.module.css';

const GraficoReceita = ({ dataInicio, dataFim }) => {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [crescimento, setCrescimento] = useState(null);

  useEffect(() => {
    carregarDados();
  }, [dataInicio, dataFim]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/dashboard/receita-comparativa', {
        params: { inicio: dataInicio, fim: dataFim }
      });
      
      if (response.data.success) {
        const dadosFormatados = response.data.data.map(item => ({
          ...item,
          mes: new Date(item.mes).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
        }));
        setDados(dadosFormatados);
        
        if (dadosFormatados.length >= 2) {
          const atual = dadosFormatados[dadosFormatados.length - 1].receita;
          const anterior = dadosFormatados[dadosFormatados.length - 2].receita;
          const variacao = ((atual - anterior) / anterior) * 100;
          setCrescimento(variacao);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar receita:', error);
      setDados([]);
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(valor);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipDate}>{label}</p>
          <p className={styles.tooltipValue}>
            Receita: <strong>{formatarMoeda(payload[0].value)}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Carregando dados de receita...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Receita Mensal</h3>
          <p className={styles.subtitle}>Comparativo de receita por período</p>
        </div>
        {crescimento !== null && (
          <div className={`${styles.crescimento} ${crescimento >= 0 ? styles.positivo : styles.negativo}`}>
            <span className={styles.crescimentoIcon}>{crescimento >= 0 ? '▲' : '▼'}</span>
            <span>{Math.abs(crescimento).toFixed(1)}%</span>
            <span className={styles.crescimentoPeriodo}>vs período anterior</span>
          </div>
        )}
      </div>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={dados} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis 
              dataKey="mes" 
              tick={{ fontSize: 11, fill: '#6c757d' }}
              tickLine={{ stroke: '#dee2e6' }}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#6c757d' }}
              tickFormatter={(value) => formatarMoeda(value).replace('MTn', '').trim()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="receita" 
              name="Receita" 
              fill="#10b981"
              radius={[8, 8, 0, 0]}
              animationDuration={1000}
            >
              {dados.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.destaque ? '#f59e0b' : '#10b981'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GraficoReceita;