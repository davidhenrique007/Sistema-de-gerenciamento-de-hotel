import React, { useState, useEffect, useCallback } from 'react';
import LayoutAdmin from './components/LayoutAdmin';
import FiltrosQuarto from './components/listagem/FiltrosQuarto';
import TabelaQuartos from './components/listagem/TabelaQuartos';
import ModalQuarto from './components/listagem/ModalQuarto';
import quartoAdminService from '../../../../services/admin/quartoAdminService';
import styles from './Quartos.module.css';

const Quartos = () => {
  const [quartos, setQuartos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estatisticas, setEstatisticas] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editingQuarto, setEditingQuarto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filtros, setFiltros] = useState({
    page: 1,
    limit: 10,
    type: 'todos',
    status: 'todos',
    floor: 'todos',
    search: '',
    sortBy: 'room_number',
    order: 'asc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const carregarQuartos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: filtros.page,
        limit: filtros.limit
      };
      
      if (filtros.type && filtros.type !== 'todos') params.type = filtros.type;
      if (filtros.status && filtros.status !== 'todos') params.status = filtros.status;
      if (filtros.floor && filtros.floor !== 'todos') params.floor = filtros.floor;
      if (filtros.search) params.search = filtros.search;
      if (filtros.sortBy) params.sortBy = filtros.sortBy;
      if (filtros.order) params.order = filtros.order;
      
      const response = await quartoAdminService.listar(params);
      
      if (response.success) {
        setQuartos(response.data || []);
        setPagination(response.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      } else {
        setError(response.message || 'Erro ao carregar quartos');
      }
    } catch (err) {
      console.error('Erro ao carregar quartos:', err);
      setError(err.message || 'Não foi possível carregar os quartos');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  const carregarEstatisticas = useCallback(async () => {
    try {
      const response = await quartoAdminService.obterEstatisticas();
      if (response.success) {
        setEstatisticas(response.data);
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  }, []);

  useEffect(() => {
    carregarQuartos();
    carregarEstatisticas();
  }, [carregarQuartos, carregarEstatisticas]);

  const handleFilterChange = (novosFiltros) => {
    setFiltros(novosFiltros);
  };

  const handleClearFilters = () => {
    setFiltros({
      page: 1,
      limit: 10,
      type: 'todos',
      status: 'todos',
      floor: 'todos',
      search: '',
      sortBy: 'room_number',
      order: 'asc'
    });
  };

  const handlePageChange = (novaPagina) => {
    setFiltros(prev => ({ ...prev, page: novaPagina }));
  };

  const handleLimitChange = (novoLimite) => {
    setFiltros(prev => ({ ...prev, limit: novoLimite, page: 1 }));
  };

  const handleSort = (coluna, ordem) => {
    setFiltros(prev => ({ ...prev, sortBy: coluna, order: ordem, page: 1 }));
  };

  const handleStatusChange = async (quarto, novoStatus) => {
    try {
      await quartoAdminService.atualizarStatus(quarto.id, novoStatus);
      carregarQuartos();
      carregarEstatisticas();
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      alert(err.message || 'Erro ao alterar status do quarto');
    }
  };

  const handleEdit = (quarto) => {
    setEditingQuarto(quarto);
    setModalTitle('Editar Quarto');
    setModalOpen(true);
  };

  const handleDelete = async (quarto) => {
    if (window.confirm(`Tem certeza que deseja excluir o quarto ${quarto.room_number}?\n\nO quarto será movido para a lixeira.`)) {
      try {
        await quartoAdminService.excluir(quarto.id);
        carregarQuartos();
        carregarEstatisticas();
        alert('Quarto movido para a lixeira com sucesso!');
      } catch (err) {
        console.error('Erro ao excluir quarto:', err);
        alert(err.message || 'Erro ao excluir quarto');
      }
    }
  };

  const handleCreate = () => {
    setEditingQuarto(null);
    setModalTitle('Novo Quarto');
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editingQuarto) {
        await quartoAdminService.atualizar(editingQuarto.id, formData);
        alert('Quarto atualizado com sucesso!');
      } else {
        await quartoAdminService.criar(formData);
        alert('Quarto criado com sucesso!');
      }
      setModalOpen(false);
      carregarQuartos();
      carregarEstatisticas();
    } catch (err) {
      console.error('Erro ao salvar quarto:', err);
      alert(err.message || 'Erro ao salvar quarto');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LayoutAdmin>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Gestão de Quartos</h1>
            <p className={styles.subtitle}>
              Gerencie todos os quartos do hotel, visualize status e mantenha o controle
            </p>
          </div>
          <button onClick={handleCreate} className={styles.novoButton}>
            + Novo Quarto
          </button>
        </div>

        {estatisticas && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>🏨</span>
              <div>
                <span className={styles.statValue}>{estatisticas.total}</span>
                <span className={styles.statLabel}>Total de quartos</span>
              </div>
            </div>
            <div className={`${styles.statCard} ${styles.disponiveis}`}>
              <span className={styles.statIcon}>🟢</span>
              <div>
                <span className={styles.statValue}>{estatisticas.disponiveis}</span>
                <span className={styles.statLabel}>Disponíveis</span>
              </div>
            </div>
            <div className={`${styles.statCard} ${styles.ocupados}`}>
              <span className={styles.statIcon}>🔴</span>
              <div>
                <span className={styles.statValue}>{estatisticas.ocupados}</span>
                <span className={styles.statLabel}>Ocupados</span>
              </div>
            </div>
            <div className={`${styles.statCard} ${styles.manutencao}`}>
              <span className={styles.statIcon}>🟡</span>
              <div>
                <span className={styles.statValue}>{estatisticas.manutencao || 0}</span>
                <span className={styles.statLabel}>Manutenção</span>
              </div>
            </div>
          </div>
        )}

        <FiltrosQuarto
          filtros={filtros}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        <TabelaQuartos
          quartos={quartos}
          loading={loading}
          sortBy={filtros.sortBy}
          order={filtros.order}
          onSort={handleSort}
          onStatusChange={handleStatusChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {!loading && quartos.length > 0 && pagination && (
          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
              {pagination.total} quartos
            </div>
            <div className={styles.paginationControls}>
              <select
                value={pagination.limit}
                onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                className={styles.limitSelect}
              >
                <option value={10}>10 por página</option>
                <option value={25}>25 por página</option>
                <option value={50}>50 por página</option>
              </select>
              <div className={styles.paginationButtons}>
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={styles.pageButton}
                >
                  Anterior
                </button>
                <span className={styles.pageInfo}>
                  Página {pagination.page} de {pagination.pages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className={styles.pageButton}
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>{error}</p>
            <button onClick={carregarQuartos} className={styles.retryButton}>
              Tentar novamente
            </button>
          </div>
        )}

        <ModalQuarto
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={modalTitle}
          initialData={editingQuarto}
          onSubmit={handleSubmit}
          loading={submitting}
        />
      </div>
    </LayoutAdmin>
  );
};

export default Quartos;
