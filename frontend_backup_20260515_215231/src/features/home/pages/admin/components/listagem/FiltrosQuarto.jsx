import React, { useState, useEffect } from 'react';
import styles from './FiltrosQuarto.module.css';

const FiltrosQuarto = ({ filtros, onFilterChange, onClearFilters }) => {
  const [searchTerm, setSearchTerm] = useState(filtros.search || '');
  const [debouncedTerm, setDebouncedTerm] = useState(filtros.search || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedTerm !== filtros.search) {
        onFilterChange({ ...filtros, search: debouncedTerm, page: 1 });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [debouncedTerm, filtros, onFilterChange]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setDebouncedTerm(value);
  };

  const handleFilterChange = (campo, valor) => {
    onFilterChange({ ...filtros, [campo]: valor, page: 1 });
  };

  const tipos = [
    { value: 'todos', label: 'Todos os tipos' },
    { value: 'standard', label: 'Standard' },
    { value: 'deluxe', label: 'Deluxe' },
    { value: 'suite', label: 'Suíte' },
    { value: 'family', label: 'Família' }
  ];

  const statusLista = [
    { value: 'todos', label: 'Todos os status' },
    { value: 'available', label: 'Disponível' },
    { value: 'occupied', label: 'Ocupado' },
    { value: 'maintenance', label: 'Manutenção' }
  ];

  const andares = [
    { value: 'todos', label: 'Todos os andares' },
    { value: '1', label: '1º Andar' },
    { value: '2', label: '2º Andar' },
    { value: '3', label: '3º Andar' }
  ];

  return (
    <div className={styles.filtrosContainer}>
      <div className={styles.searchBox}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder="Buscar por número do quarto..."
          value={searchTerm}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.filtrosRow}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Tipo</label>
          <select
            value={filtros.type || 'todos'}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className={styles.filterSelect}
          >
            {tipos.map(tipo => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Status</label>
          <select
            value={filtros.status || 'todos'}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={styles.filterSelect}
          >
            {statusLista.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Andar</label>
          <select
            value={filtros.floor || 'todos'}
            onChange={(e) => handleFilterChange('floor', e.target.value)}
            className={styles.filterSelect}
          >
            {andares.map(andar => (
              <option key={andar.value} value={andar.value}>{andar.label}</option>
            ))}
          </select>
        </div>

        <button onClick={onClearFilters} className={styles.clearButton}>
          Limpar filtros
        </button>
      </div>
    </div>
  );
};

export default FiltrosQuarto;