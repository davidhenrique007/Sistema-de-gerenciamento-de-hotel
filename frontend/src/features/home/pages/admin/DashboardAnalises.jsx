// frontend/src/features/home/pages/admin/DashboardAnalises.jsx
import React, { useState, useRef } from 'react';
import LayoutAdmin from './components/LayoutAdmin';
import FiltrosData from './components/grafico/FiltrosData';
import GraficoOcupacao from './components/grafico/GraficoOcupacao';
import GraficoReceita from './components/grafico/GraficoReceita';
import GraficoPizza from './components/grafico/GraficoPizza';
import BotaoExportarGrafico from './components/grafico/BotaoExportarGrafico';
import styles from './DashboardAnalises.module.css';

const DashboardAnalises = () => {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [periodoAtivo, setPeriodoAtivo] = useState('mes');
  
  const graficoOcupacaoRef = useRef(null);
  const graficoReceitaRef = useRef(null);
  const graficoPizzaRef = useRef(null);

  const handleFilterChange = (inicio, fim) => {
    setDataInicio(inicio);
    setDataFim(fim);
  };

  return (
    <LayoutAdmin>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Análises e Métricas</h1>
          <p className={styles.subtitle}>
            Visualize dados detalhados do hotel e tome decisões estratégicas
          </p>
        </div>

        <FiltrosData 
          onFilterChange={handleFilterChange}
          periodoAtivo={periodoAtivo}
          setPeriodoAtivo={setPeriodoAtivo}
        />

        <div className={styles.exportBar}>
          <BotaoExportarGrafico 
            chartRef={graficoOcupacaoRef}
            titulo="ocupacao-diaria"
          />
          <BotaoExportarGrafico 
            chartRef={graficoReceitaRef}
            titulo="receita-mensal"
          />
          <BotaoExportarGrafico 
            chartRef={graficoPizzaRef}
            titulo="distribuicao-quartos"
          />
        </div>

        <div className={styles.grid}>
          <div className={styles.gridItem} ref={graficoOcupacaoRef}>
            <GraficoOcupacao dataInicio={dataInicio} dataFim={dataFim} />
          </div>
          
          <div className={styles.gridItem} ref={graficoReceitaRef}>
            <GraficoReceita dataInicio={dataInicio} dataFim={dataFim} />
          </div>
          
          <div className={styles.gridItem} ref={graficoPizzaRef}>
            <GraficoPizza dataInicio={dataInicio} dataFim={dataFim} />
          </div>
        </div>
      </div>
    </LayoutAdmin>
  );
};

export default DashboardAnalises;