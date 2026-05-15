import React, { useState } from 'react';
import StatusBadge from '../StatusBadge';
import styles from './TabelaQuartos.module.css';

const TabelaQuartos = ({ quartos, loading, sortBy, order, onSort, onStatusChange, onEdit, onDelete, onViewReservas }) => {
  const [actionLoading, setActionLoading] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [quartoToDelete, setQuartoToDelete] = useState(null);

  const handleSort = (coluna) => {
    const newOrder = sortBy === coluna && order === 'asc' ? 'desc' : 'asc';
    onSort(coluna, newOrder);
  };

  const getSortIcon = (coluna) => {
    if (sortBy !== coluna) return '↕️';
    return order === 'asc' ? '↑' : '↓';
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-MZ', { 
      style: 'currency', 
      currency: 'MZN',
      minimumFractionDigits: 2
    }).format(valor);
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getTipoLabel = (tipo) => {
    const tipos = {
      standard: 'Standard',
      deluxe: 'Deluxe',
      suite: 'Suíte',
      family: 'Família'
    };
    return tipos[tipo] || tipo;
  };

  const handleDeleteClick = (quarto) => {
    setQuartoToDelete(quarto);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (quartoToDelete) {
      onDelete(quartoToDelete);
      setShowConfirmModal(false);
      setQuartoToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.skeletonContainer}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className={styles.skeletonRow}>
            <div className={styles.skeletonCell}></div>
            <div className={styles.skeletonCell}></div>
            <div className={styles.skeletonCell}></div>
            <div className={styles.skeletonCell}></div>
            <div className={styles.skeletonCell}></div>
            <div className={styles.skeletonCell}></div>
            <div className={styles.skeletonCell}></div>
          </div>
        ))}
      </div>
    );
  }

  if (quartos.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🏨</div>
        <h3 className={styles.emptyTitle}>Nenhum quarto encontrado</h3>
        <p className={styles.emptyText}>
          Tente ajustar os filtros ou buscar por outro termo
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.headerRow}>
                <th className={styles.th} onClick={() => handleSort('room_number')}>
                  Nº {getSortIcon('room_number')}
                </th>
                <th className={styles.th} onClick={() => handleSort('type')}>
                  Tipo {getSortIcon('type')}
                </th>
                <th className={styles.th} onClick={() => handleSort('floor')}>
                  Andar {getSortIcon('floor')}
                </th>
                <th className={styles.th} onClick={() => handleSort('status')}>
                  Status {getSortIcon('status')}
                </th>
                <th className={styles.th} onClick={() => handleSort('price_per_night')}>
                  Preço {getSortIcon('price_per_night')}
                </th>
                <th className={styles.th}>Atualização</th>
                <th className={styles.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {quartos.map((quarto) => (
                <tr key={quarto.id} className={styles.row}>
                  <td className={styles.td} data-label="Nº">
                    <span className={styles.roomNumber}>#{quarto.room_number}</span>
                  </td>
                  <td className={styles.td} data-label="Tipo">
                    <span className={styles.roomType}>{getTipoLabel(quarto.type)}</span>
                  </td>
                  <td className={styles.td} data-label="Andar">
                    <span className={styles.floorBadge}>{quarto.floor}º</span>
                  </td>
                  <td className={styles.td} data-label="Status">
                    <StatusBadge status={quarto.status} />
                  </td>
                  <td className={styles.td} data-label="Preço">
                    <span className={styles.price}>{formatarMoeda(quarto.price_per_night)}</span>
                  </td>
                  <td className={styles.td} data-label="Atualização">
                    <span className={styles.date}>{formatarData(quarto.updated_at)}</span>
                  </td>
                  <td className={styles.td} data-label="Ações">
                    <div className={styles.actions}>
                      <button
                        onClick={() => onEdit(quarto)}
                        className={`${styles.actionBtn} ${styles.editBtn}`}
                        title="Editar quarto"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteClick(quarto)}
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        title="Excluir quarto"
                      >
                        🗑️
                      </button>
                      <button
                        onClick={() => onViewReservas(quarto)}
                        className={`${styles.actionBtn} ${styles.viewBtn}`}
                        title="Ver reservas"
                      >
                        📋
                      </button>
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            onStatusChange(quarto, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className={styles.statusSelect}
                        disabled={actionLoading === quarto.id}
                      >
                        <option value="">Status</option>
                        <option value="available">Disponível</option>
                        <option value="occupied">Ocupado</option>
                        <option value="maintenance">Manutenção</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {showConfirmModal && quartoToDelete && (
        <div className={styles.modalOverlay} onClick={() => setShowConfirmModal(false)}>
          <div className={styles.confirmModal}>
            <div className={styles.confirmModalHeader}>
              <span className={styles.confirmIcon}>⚠️</span>
              <h3>Confirmar Exclusão</h3>
            </div>
            <div className={styles.confirmModalBody}>
              <p>Tem certeza que deseja excluir o quarto <strong>#{quartoToDelete.room_number}</strong>?</p>
              <p className={styles.confirmWarning}>
                O quarto será movido para a lixeira e poderá ser recuperado posteriormente.
              </p>
            </div>
            <div className={styles.confirmModalFooter}>
              <button 
                className={styles.cancelBtn}
                onClick={() => setShowConfirmModal(false)}
              >
                Cancelar
              </button>
              <button 
                className={styles.confirmBtn}
                onClick={handleConfirmDelete}
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TabelaQuartos;
