// frontend/src/features/home/pages/admin/components/grafico/FiltrosData.jsx
import React, { useState } from 'react';
import styles from './FiltrosData.module.css';

const FiltrosData = ({ onFilterChange, periodoAtivo, setPeriodoAtivo }) => {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [customError, setCustomError] = useState('');

  const opcoes = [
    { id: 'hoje', label: 'Hoje' },
    { id: 'semana', label: 'Semana' },
    { id: 'mes', label: 'Mês' },
    { id: 'trimestre', label: 'Trimestre' },
    { id: 'personalizado', label: 'Personalizado' }
  ];

  const calcularPeriodo = (tipo) => {
    const hoje = new Date();
    const fim = new Date();
    let inicio = new Date();

    switch (tipo) {
      case 'hoje':
        inicio = new Date(hoje.setHours(0, 0, 0, 0));
        fim.setHours(23, 59, 59, 999);
        break;
      case 'semana':
        inicio.setDate(hoje.getDate() - 7);
        break;
      case 'mes':
        inicio.setDate(hoje.getDate() - 30);
        break;
      case 'trimestre':
        inicio.setDate(hoje.getDate() - 90);
        break;
      default:
        return null;
    }

    return {
      inicio: inicio.toISOString().split('T')[0],
      fim: fim.toISOString().split('T')[0]
    };
  };

  const aplicarFiltro = (tipo) => {
    setPeriodoAtivo(tipo);
    setCustomError('');

    if (tipo === 'personalizado') {
      if (!dataInicio || !dataFim) {
        setCustomError('Selecione as datas de início e fim');
        return;
      }
      if (new Date(dataInicio) > new Date(dataFim)) {
        setCustomError('Data de início não pode ser maior que data de fim');
        return;
      }
      onFilterChange(dataInicio, dataFim);
    } else {
      const periodo = calcularPeriodo(tipo);
      if (periodo) {
        onFilterChange(periodo.inicio, periodo.fim);
      }
    }
  };

  const aplicarPersonalizado = () => {
    aplicarFiltro('personalizado');
  };

  return (
    <div className={styles.filtrosContainer}>
      <div className={styles.filtrosWrapper}>
        {opcoes.map((opcao) => (
          <button
            key={opcao.id}
            className={`${styles.filtroBtn} ${periodoAtivo === opcao.id ? styles.active : ''}`}
            onClick={() => aplicarFiltro(opcao.id)}
          >
            {opcao.label}
          </button>
        ))}
      </div>

      {periodoAtivo === 'personalizado' && (
        <div className={styles.customRange}>
          <div className={styles.dateInputs}>
            <div className={styles.dateGroup}>
              <label>Data Início</label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className={styles.dateInput}
                max={dataFim || undefined}
              />
            </div>
            <span className={styles.dateSeparator}>até</span>
            <div className={styles.dateGroup}>
              <label>Data Fim</label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className={styles.dateInput}
                min={dataInicio || undefined}
              />
            </div>
            <button onClick={aplicarPersonalizado} className={styles.aplicarBtn}>
              Aplicar
            </button>
          </div>
          {customError && <p className={styles.errorMsg}>{customError}</p>}
        </div>
      )}
    </div>
  );
};

export default FiltrosData;