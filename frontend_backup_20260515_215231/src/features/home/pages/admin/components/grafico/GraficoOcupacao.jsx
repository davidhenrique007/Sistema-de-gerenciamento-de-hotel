// frontend/src/features/home/pages/admin/components/grafico/GraficoOcupacao.jsx
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import api from '@services/api';
import styles from './GraficoOcupacao.module.css';

const GraficoOcupacao = ({ dataInicio, dataFim }) => {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ocupacaoMedia, setOcupacaoMedia] = useState(0);
  const [picoMaximo, setPicoMaximo] = useState(0);

  useEffect(() => {
    carregarDados();
  }, [dataInicio, dataFim]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/dashboard/ocupacao-diaria', {
        params: { inicio: dataInicio, fim: dataFim }
      });
      
      if (response.data.success) {
        const dadosFormatados = response.data.data.map(item => ({
          ...item,
          data: new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
        }));
        setDados(dadosFormatados);
        
        const media = dadosFormatados.reduce((acc, curr) => acc + curr.ocupacao, 0) / dadosFormatados.length;
        setOcupacaoMedia(Math.round(media));
        
        const maximo = Math.max(...dadosFormatados.map(d => d.ocupacao));
        setPicoMaximo(maximo);
      }
    } catch (error) {
      console.error('Erro ao carregar ocupação:', error);
      setDados([]);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipDate}>{label}</p>
          <p className={styles.tooltipValue}>
            Ocupação: <strong>{payload[0].value}%</strong>
          </p>
          <p className={styles.tooltipRooms}>
            Quartos ocupados: <strong>{Math.round(payload[0].value * 43 / 100)}</strong> de 43
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
        <p>Carregando dados de ocupação...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Ocupação Diária</h3>
          <p className={styles.subtitle}>Taxa de ocupação dos últimos 30 dias</p>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Média</span>
            <span className={styles.statValue}>{ocupacaoMedia}%</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Pico Máximo</span>
            <span className={styles.statValue}>{picoMaximo}%</span>
          </div>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={dados} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis 
              dataKey="data" 
              tick={{ fontSize: 11, fill: '#6c757d' }}
              tickLine={{ stroke: '#dee2e6' }}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#6c757d' }}
              unit="%"
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="ocupacao"
              name="Taxa de Ocupação"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 3, fill: '#2563eb' }}
              activeDot={{ r: 6 }}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GraficoOcupacao;