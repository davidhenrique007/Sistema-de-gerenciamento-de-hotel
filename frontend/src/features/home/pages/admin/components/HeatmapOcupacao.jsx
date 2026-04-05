import React, { useState, useEffect } from 'react';
import api from '../../../../../services/api';
import styles from './HeatmapOcupacao.module.css';

const HeatmapOcupacao = () => {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await api.get('/admin/dashboard/ocupacao-por-tipo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setDados(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar heatmap:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      standard: 'Quarto Standard',
      deluxe: 'Suíte Deluxe',
      suite: 'Suíte Presidencial',
      family: 'Quarto Família'
    };
    return labels[tipo] || tipo;
  };

  const getCorPorPercentual = (ocupados, total) => {
    const percentual = total === 0 ? 0 : (ocupados / total) * 100;
    if (percentual >= 80) return styles.altaOcupacao;
    if (percentual >= 50) return styles.mediaOcupacao;
    if (percentual >= 20) return styles.baixaOcupacao;
    return styles.muitoBaixaOcupacao;
  };

  if (loading) {
    return <div className={styles.heatmapLoading}>Carregando mapa de ocupação...</div>;
  }

  if (dados.length === 0) {
    return <div className={styles.heatmapEmpty}>Nenhum dado de ocupação disponível</div>;
  }

  return (
    <div className={styles.heatmap}>
      <div className={styles.heatmapGrid}>
        {dados.map((item) => (
          <div key={item.tipo_quarto} className={`${styles.heatmapCard} ${getCorPorPercentual(item.ocupados, item.total_quartos)}`}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>
                {item.tipo_quarto === 'standard' && '🛏️'}
                {item.tipo_quarto === 'deluxe' && '⭐'}
                {item.tipo_quarto === 'suite' && '👑'}
                {item.tipo_quarto === 'family' && '👨‍👩‍👧‍👦'}
              </span>
              <h4 className={styles.cardTitle}>{getTipoLabel(item.tipo_quarto)}</h4>
            </div>
            <div className={styles.cardStats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Ocupados</span>
                <span className={styles.statValue}>{item.ocupados}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Total</span>
                <span className={styles.statValue}>{item.total_quartos}</span>
              </div>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${item.total_quartos === 0 ? 0 : (item.ocupados / item.total_quartos) * 100}%` }}
              />
            </div>
            <div className={styles.percentual}>
              {item.total_quartos === 0 ? 0 : Math.round((item.ocupados / item.total_quartos) * 100)}% ocupado
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeatmapOcupacao;
