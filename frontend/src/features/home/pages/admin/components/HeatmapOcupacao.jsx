// frontend/src/features/home/pages/admin/components/HeatmapOcupacao.jsx
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
      const response = await api.get('/dashboard/ocupacao-por-tipo');
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

  const getOcupacaoPercentual = (ocupados, total) => {
    if (total === 0) return 0;
    return Math.round((ocupados / total) * 100);
  };

  const getCorPorPercentual = (percentual) => {
    if (percentual >= 80) return styles.altaOcupacao;
    if (percentual >= 50) return styles.mediaOcupacao;
    if (percentual >= 20) return styles.baixaOcupacao;
    return styles.muitoBaixaOcupacao;
  };

  if (loading) {
    return (
      <div className={styles.heatmapLoading}>
        <div className={styles.spinner}></div>
        <p>Carregando mapa de ocupação...</p>
      </div>
    );
  }

  if (dados.length === 0) {
    return (
      <div className={styles.heatmapEmpty}>
        <p>Nenhum dado de ocupação disponível</p>
      </div>
    );
  }

  return (
    <div className={styles.heatmap}>
      <div className={styles.heatmapGrid}>
        {dados.map((item) => {
          const percentual = getOcupacaoPercentual(item.ocupados, item.total_quartos);
          const corClasse = getCorPorPercentual(percentual);
          
          return (
            <div key={item.tipo_quarto} className={`${styles.heatmapCard} ${corClasse}`}>
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
                  style={{ width: `${percentual}%` }}
                />
              </div>
              <div className={styles.percentual}>
                {percentual}% ocupado
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles.heatmapLegend}>
        <div className={styles.legendTitle}>Legenda</div>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.altaOcupacao}`}></div>
            <span>≥ 80%</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.mediaOcupacao}`}></div>
            <span>50% - 79%</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.baixaOcupacao}`}></div>
            <span>20% - 49%</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.muitoBaixaOcupacao}`}></div>
            <span>&lt; 20%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapOcupacao;