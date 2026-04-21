import React, { useState, useEffect, useCallback } from 'react';
import LayoutAdmin from './components/LayoutAdmin';
import quartoAdminService from '../../../../services/admin/quartoAdminService';
import styles from './LixeiraQuartos.module.css';

const LixeiraQuartos = () => {
  const [quartos, setQuartos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const carregarLixeira = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      
      const response = await quartoAdminService.listarLixeira(params);
      
      if (response.success) {
        setQuartos(response.data || []);
      } else {
        setError(response.message || 'Erro ao carregar lixeira');
      }
    } catch (err) {
      console.error('Erro ao carregar lixeira:', err);
      setError(err.message || 'Não foi possível carregar a lixeira');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    carregarLixeira();
  }, [carregarLixeira]);

  const handleRecuperar = async (quarto) => {
    if (window.confirm(`Deseja recuperar o quarto ${quarto.room_number}?`)) {
      try {
        await quartoAdminService.recuperar(quarto.id);
        carregarLixeira();
        alert('Quarto recuperado com sucesso!');
      } catch (err) {
        console.error('Erro ao recuperar:', err);
        alert(err.message || 'Erro ao recuperar quarto');
      }
    }
  };

  const handleExcluirPermanente = async (quarto) => {
    if (window.confirm(`Tem certeza que deseja excluir PERMANENTEMENTE o quarto ${quarto.room_number}?\n\nEsta ação não pode ser desfeita.`)) {
      try {
        await quartoAdminService.excluirPermanentemente(quarto.id);
        carregarLixeira();
        alert('Quarto removido permanentemente!');
      } catch (err) {
        console.error('Erro ao excluir permanentemente:', err);
        alert(err.message || 'Erro ao excluir permanentemente');
      }
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-MZ', { 
      style: 'currency', 
      currency: 'MZN'
    }).format(valor);
  };

  const formatarData = (data) => {
    if (!data) return '—';
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (loading) {
    return (
      <LayoutAdmin>
        <div className={styles.container}>
          <div className={styles.loadingContainer}>Carregando lixeira...</div>
        </div>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>🗑️ Lixeira de Quartos</h1>
            <p className={styles.subtitle}>
              Quartos excluídos ficam aqui por tempo indeterminado. Você pode recuperá-los ou excluí-los permanentemente.
            </p>
          </div>
        </div>

        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Buscar quarto excluído..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {error ? (
          <div className={styles.errorContainer}>
            <p>{error}</p>
            <button onClick={carregarLixeira} className={styles.retryButton}>Tentar novamente</button>
          </div>
        ) : quartos.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🗑️</div>
            <h3>Lixeira vazia</h3>
            <p>Nenhum quarto foi excluído ainda.</p>
          </div>
        ) : (
          <>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nº</th>
                    <th>Tipo</th>
                    <th>Andar</th>
                    <th>Preço</th>
                    <th>Data exclusão</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {quartos.map(quarto => (
                    <tr key={quarto.id}>
                      <td>#{quarto.room_number}</td>
                      <td>{getTipoLabel(quarto.type)}</td>
                      <td>{quarto.floor}º</td>
                      <td>{formatarMoeda(quarto.price_per_night)}</td>
                      <td>{formatarData(quarto.deleted_at)}</td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            onClick={() => handleRecuperar(quarto)}
                            className={`${styles.actionBtn} ${styles.recuperarBtn}`}
                          >
                            ↩️ Recuperar
                          </button>
                          <button
                            onClick={() => handleExcluirPermanente(quarto)}
                            className={`${styles.actionBtn} ${styles.permanenteBtn}`}
                          >
                            🗑️ Excluir permanentemente
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </LayoutAdmin>
  );
};

export default LixeiraQuartos;
