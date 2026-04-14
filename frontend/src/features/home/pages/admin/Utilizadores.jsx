// frontend/src/features/home/pages/admin/Utilizadores.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiSearch, FiFilter } from 'react-icons/fi';
import LayoutAdmin from './components/LayoutAdmin';
import TabelaUtilizadores from './components/utilizadores/TabelaUtilizadores';
import ModalUtilizador from './components/utilizadores/ModalUtilizador';
import styles from './Utilizadores.module.css';

const Utilizadores = () => {
  const [utilizadores, setUtilizadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [utilizadorEditando, setUtilizadorEditando] = useState(null);
  const [filtros, setFiltros] = useState({
    search: '',
    role: '',
    is_active: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    admin: 0,
    receptionist: 0,
    financial: 0
  });

  const carregarUtilizadores = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(
          Object.entries(filtros).filter(([_, v]) => v && v !== '')
        )
      });

      const response = await fetch(`http://localhost:5000/api/admin/utilizadores?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setUtilizadores(data.data);
        setStats(data.stats);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar utilizadores:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filtros]);

  useEffect(() => {
    carregarUtilizadores();
  }, [carregarUtilizadores]);

  const handleFiltroChange = (novosFiltros) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleLimparFiltros = () => {
    setFiltros({ search: '', role: '', is_active: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleNovoUtilizador = () => {
    setUtilizadorEditando(null);
    setModalAberto(true);
  };

  const handleEditar = (utilizador) => {
    setUtilizadorEditando(utilizador);
    setModalAberto(true);
  };

  const handleModalClose = () => {
    setModalAberto(false);
    setUtilizadorEditando(null);
    carregarUtilizadores();
  };

  const cards = [
    { titulo: 'Total Utilizadores', valor: stats.total, icone: '👥', cor: 'blue' },
    { titulo: 'Ativos', valor: stats.ativos, icone: '✅', cor: 'green' },
    { titulo: 'Administradores', valor: stats.admin, icone: '👑', cor: 'purple' },
    { titulo: 'Rececionistas', valor: stats.receptionist, icone: '🛎️', cor: 'orange' },
    { titulo: 'Financeiro', valor: stats.financial, icone: '💰', cor: 'teal' }
  ];

  const getCardClass = (cor) => {
    const classes = {
      blue: `${styles.statCard} ${styles.cardBlue}`,
      green: `${styles.statCard} ${styles.cardGreen}`,
      purple: `${styles.statCard} ${styles.cardPurple}`,
      orange: `${styles.statCard} ${styles.cardOrange}`,
      teal: `${styles.statCard} ${styles.cardTeal}`
    };
    return classes[cor] || styles.statCard;
  };

  return (
    <LayoutAdmin>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Gestão de Utilizadores</h1>
            <p className={styles.subtitle}>Gerencie todos os utilizadores do sistema e suas permissões</p>
          </div>
          <button onClick={handleNovoUtilizador} className={styles.btnNovo}>
            <FiPlus /> Novo Utilizador
          </button>
        </div>

        <div className={styles.statsGrid}>
          {cards.map((card, index) => (
            <div key={index} className={getCardClass(card.cor)}>
              <div className={styles.statIcon}>{card.icone}</div>
              <div className={styles.statInfo}>
                <h3>{card.valor}</h3>
                <p>{card.titulo}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.filtersSection}>
          <div className={styles.filtersHeader}>
            <h2 className={styles.filtersTitle}>
              <FiFilter /> Filtros
            </h2>
            <button onClick={handleLimparFiltros} className={styles.clearButton}>
              Limpar Filtros
            </button>
          </div>
          <div className={styles.filtersGrid}>
            <div className={styles.filterGroup}>
              <label>Buscar</label>
              <div className={styles.searchWrapper}>
                <FiSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Nome ou email..."
                  value={filtros.search}
                  onChange={(e) => handleFiltroChange({ search: e.target.value })}
                  className={styles.searchInput}
                />
              </div>
            </div>
            <div className={styles.filterGroup}>
              <label>Perfil</label>
              <select
                value={filtros.role}
                onChange={(e) => handleFiltroChange({ role: e.target.value })}
                className={styles.filterSelect}
              >
                <option value="">Todos os perfis</option>
                <option value="admin">Administrador</option>
                <option value="receptionist">Rececionista</option>
                <option value="financial">Financeiro</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>Estado</label>
              <select
                value={filtros.is_active}
                onChange={(e) => handleFiltroChange({ is_active: e.target.value })}
                className={styles.filterSelect}
              >
                <option value="">Todos</option>
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
          </div>
        </div>

        <TabelaUtilizadores
          utilizadores={utilizadores}
          loading={loading}
          pagination={pagination}
          onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          onLimitChange={(limit) => setPagination(prev => ({ ...prev, limit, page: 1 }))}
          onEditar={handleEditar}
          onRefresh={carregarUtilizadores}
        />

        <ModalUtilizador
          isOpen={modalAberto}
          onClose={handleModalClose}
          utilizador={utilizadorEditando}
          onSuccess={handleModalClose}
        />
      </div>
    </LayoutAdmin>
  );
};

export default Utilizadores;