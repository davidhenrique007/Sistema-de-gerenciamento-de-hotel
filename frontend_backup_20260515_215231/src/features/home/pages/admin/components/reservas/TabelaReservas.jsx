import React, { useState, useMemo } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import AcoesReserva from './AcoesReserva';
import DetalheReserva from './DetalheReserva';
import styles from './TabelaReservas.module.css';

const TabelaReservas = ({ reservas, loading, pagination, onPageChange, onLimitChange }) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'data_checkin', direction: 'desc' });

  const getUserPermissions = () => {
    try {
      const adminUser = localStorage.getItem('admin_user');
      if (adminUser) {
        const user = JSON.parse(adminUser);
        return { role: user.role || 'admin' };
      }
    } catch (e) {
      console.error('Erro ao obter permissões:', e);
    }
    return { role: 'admin' };
  };

  const permissoes = getUserPermissions();

  const getStatusClass = (status) => {
    const classes = {
      CONFIRMADA: styles.statusConfirmed,
      PENDENTE: styles.statusPending,
      CANCELADA: styles.statusCancelled,
      FINALIZADA: styles.statusFinished,
      confirmed: styles.statusConfirmed,
      pending: styles.statusPending,
      cancelled: styles.statusCancelled,
      finished: styles.statusFinished
    };
    return `${styles.statusBadge} ${classes[status] || styles.statusPending}`;
  };

  const getPaymentStatusClass = (status) => {
    const classes = {
      PAGO: styles.paymentPaid,
      PENDENTE: styles.paymentPending,
      PARCIAL: styles.paymentPartial,
      paid: styles.paymentPaid,
      pending: styles.paymentPending,
      partial: styles.paymentPartial
    };
    return `${styles.statusBadge} ${classes[status] || styles.paymentPending}`;
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "-";
    const numero = parseFloat(value);
    if (isNaN(numero)) return "-";
    return new Intl.NumberFormat("pt-MZ", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numero) + " MTn";
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const sortedReservas = useMemo(() => {
    if (!sortConfig.key || !reservas.length) return reservas;

    return [...reservas].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (sortConfig.key === 'valor_total') {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [reservas, sortConfig]);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  if (loading) {
    return (
      <div className={styles.skeletonTable}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className={styles.skeletonRow}>
            <div className={styles.skeletonLine}></div>
          </div>
        ))}
      </div>
    );
  }

  if (reservas.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📋</div>
        <h3 className={styles.emptyTitle}>Nenhuma reserva encontrada</h3>
        <p className={styles.emptyMessage}>Tente ajustar os filtros ou criar uma nova reserva</p>
      </div>
    );
  }

    const handleAcaoRealizada = () => {
    // Recarregar a lista de reservas
    if (typeof onPageChange === 'function') {
      onPageChange(pagination.page);
    }
    // Forçar recarregamento dos dados
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div>
      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Código</th>
              <th className={styles.sortableHeader} onClick={() => handleSort('cliente_nome')}>
                Cliente {sortConfig.key === 'cliente_nome' && <span className={styles.sortIcon}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th>Telefone</th>
              <th>Quarto</th>
              <th className={styles.sortableHeader} onClick={() => handleSort('data_checkin')}>
                Check-in {sortConfig.key === 'data_checkin' && <span className={styles.sortIcon}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th className={styles.sortableHeader} onClick={() => handleSort('valor_total')}>
                Valor {sortConfig.key === 'valor_total' && <span className={styles.sortIcon}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {sortedReservas.map((reserva) => (
              <React.Fragment key={reserva.id}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {reserva.codigo_reserva}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reserva.cliente_nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reserva.cliente_telefone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reserva.quarto_numero} - {reserva.quarto_tipo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(reserva.data_checkin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(reserva.valor_total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className={getStatusClass(reserva.status_reserva)}>
                        {reserva.status_reserva}
                      </span>
                      <span className={getPaymentStatusClass(reserva.status_pagamento)}>
                        {reserva.status_pagamento}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <AcoesReserva 
                        reserva={reserva}
                        onAcaoRealizada={handleAcaoRealizada}
                        permissoes={permissoes}
                      />
                      <button
                        onClick={() => setExpandedRow(expandedRow === reserva.id ? null : reserva.id)}
                        className={styles.actionButton}
                        title="Ver detalhes"
                      >
                        {expandedRow === reserva.id ? <FiChevronUp /> : <FiChevronDown />}
                        <span style={{ marginLeft: '4px', fontSize: '0.7rem' }}>Detalhes</span>
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedRow === reserva.id && (
                  <tr className={styles.expandableRow}>
                    <td colSpan="8" className={styles.expandableContent}>
                      <DetalheReserva reservaId={reserva.id} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.paginationContainer}>
        <div className={styles.limitSelector}>
          <span>Mostrar</span>
          <select
            value={pagination.limit}
            onChange={(e) => onLimitChange(parseInt(e.target.value))}
            className={styles.limitSelect}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>por página</span>
        </div>
        
        <div className={styles.paginationControls}>
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className={styles.paginationButton}
          >
            Anterior
          </button>
          <span className={styles.pageInfo}>
            Página {pagination.page} de {pagination.pages}
          </span>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className={styles.paginationButton}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabelaReservas;


