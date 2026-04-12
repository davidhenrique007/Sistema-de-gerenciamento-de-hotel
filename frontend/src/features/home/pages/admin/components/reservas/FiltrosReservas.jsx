import React, { useState, useCallback } from 'react';
import { FiSearch } from 'react-icons/fi';
import styles from './FiltrosReservas.module.css';

const FiltrosReservas = ({ filtros, onFiltroChange }) => {
  const [searchTerm, setSearchTerm] = useState(filtros.search);
  const [phoneTerm, setPhoneTerm] = useState(filtros.phone);

  // Valores devem corresponder ao banco de dados
  const tiposQuarto = ['standard', 'superior', 'deluxe', 'suite', 'presidential'];
  const statusPagamento = ['pending', 'partial', 'paid'];
  const statusReserva = ['pending', 'confirmed', 'cancelled', 'finished'];

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedSearch = useCallback(
    debounce((value) => onFiltroChange({ search: value }), 500),
    []
  );

  const debouncedPhone = useCallback(
    debounce((value) => onFiltroChange({ phone: value }), 500),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhoneTerm(value);
    debouncedPhone(value);
  };

  const handleFilterChange = (key, value) => {
    onFiltroChange({ [key]: value });
  };

  // Mapeamento para exibição (maiúsculo para o usuário)
  const getStatusPagamentoLabel = (status) => {
    const labels = {
      pending: 'PENDENTE',
      partial: 'PARCIAL',
      paid: 'PAGO'
    };
    return labels[status] || status;
  };

  const getStatusReservaLabel = (status) => {
    const labels = {
      pending: 'PENDENTE',
      confirmed: 'CONFIRMADA',
      cancelled: 'CANCELADA',
      finished: 'FINALIZADA'
    };
    return labels[status] || status;
  };

  const getTipoQuartoLabel = (tipo) => {
    return tipo.charAt(0).toUpperCase() + tipo.slice(1);
  };

  return (
    <div className={styles.filtersWrapper}>
      <div className={styles.filtersGrid}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>CLIENTE</label>
          <div className={styles.inputWrapper}>
            <FiSearch className={styles.inputIcon} />
            <input
              type="text"
              placeholder="Buscar por cliente ou código..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={styles.filterInput}
            />
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>TELEFONE</label>
          <div className={styles.inputWrapper}>
            <FiSearch className={styles.inputIcon} />
            <input
              type="text"
              placeholder="Telefone do cliente..."
              value={phoneTerm}
              onChange={handlePhoneChange}
              className={styles.filterInput}
            />
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>TIPO DE QUARTO</label>
          <select
            value={filtros.roomType}
            onChange={(e) => handleFilterChange('roomType', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Todos os tipos de quarto</option>
            {tiposQuarto.map(tipo => (
              <option key={tipo} value={tipo}>{getTipoQuartoLabel(tipo)}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>STATUS PAGAMENTO</label>
          <select
            value={filtros.paymentStatus}
            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Status pagamento</option>
            {statusPagamento.map(status => (
              <option key={status} value={status}>{getStatusPagamentoLabel(status)}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>STATUS RESERVA</label>
          <select
            value={filtros.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Status reserva</option>
            {statusReserva.map(status => (
              <option key={status} value={status}>{getStatusReservaLabel(status)}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>NÚMERO DO QUARTO</label>
          <input
            type="text"
            placeholder="Número do quarto"
            value={filtros.roomNumber}
            onChange={(e) => handleFilterChange('roomNumber', e.target.value)}
            className={styles.filterInput}
          />
        </div>
      </div>

      <div className={styles.dateRangeGrid}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>CHECK-IN A PARTIR DE</label>
          <input
            type="date"
            value={filtros.checkInFrom}
            onChange={(e) => handleFilterChange('checkInFrom', e.target.value)}
            className={styles.dateInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>CHECK-IN ATÉ</label>
          <input
            type="date"
            value={filtros.checkInTo}
            onChange={(e) => handleFilterChange('checkInTo', e.target.value)}
            className={styles.dateInput}
          />
        </div>
      </div>
    </div>
  );
};

export default FiltrosReservas;
