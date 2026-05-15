import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';
import { fetchLogs, exportLogs } from '@/services/logService';
import styles from './Logs.module.css';

const Logs = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({ type: '', user: '' });

  useEffect(() => {
    loadLogs();
  }, [page, filters]);

  const loadLogs = async () => {
    setLoading(true);
    const result = await fetchLogs(filters, page, 20);
    setLogs(result.data);
    setTotalPages(result.totalPages);
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return <span className={`${styles.badge} ${styles.success}`}>Sucesso</span>;
      case 'error':
        return <span className={`${styles.badge} ${styles.error}`}>Erro</span>;
      case 'warning':
        return <span className={`${styles.badge} ${styles.warning}`}>Atenção</span>;
      default:
        return <span className={`${styles.badge} ${styles.info}`}>Info</span>;
    }
  };

  const handleExport = () => {
    exportLogs(filters);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => navigate('/admin/configuracoes')} className={styles.backButton}>
          ← {t('common.back', 'Voltar')}
        </button>
        <h1 className={styles.title}>{t('seguranca.logs_auditoria', 'Logs de Auditoria')}</h1>
        <p className={styles.description}>
          {t('seguranca.logs_desc', 'Histórico completo de atividades do sistema')}
        </p>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder={t('seguranca.filtrar_usuario', 'Filtrar por usuário...')}
          value={filters.user}
          onChange={(e) => setFilters({ ...filters, user: e.target.value })}
          className={styles.filterInput}
        />
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className={styles.filterSelect}
        >
          <option value="">{t('seguranca.todos_tipos', 'Todos os tipos')}</option>
          <option value="login">{t('seguranca.login', 'Login')}</option>
          <option value="reservation">{t('seguranca.reserva', 'Reserva')}</option>
          <option value="payment">{t('seguranca.pagamento', 'Pagamento')}</option>
          <option value="settings">{t('seguranca.configuracao', 'Configuração')}</option>
        </select>
        <button onClick={handleExport} className={styles.exportButton}>
          📥 {t('seguranca.exportar', 'Exportar')}
        </button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}>{t('common.loading', 'Carregando...')}</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('seguranca.usuario', 'Usuário')}</th>
                <th>{t('seguranca.acao', 'Ação')}</th>
                <th>{t('seguranca.modulo', 'Módulo')}</th>
                <th>{t('seguranca.data_hora', 'Data/Hora')}</th>
                <th>{t('seguranca.ip', 'IP')}</th>
                <th>{t('seguranca.status', 'Status')}</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className={styles.emptyRow}>
                    {t('seguranca.nenhum_log', 'Nenhum log encontrado')}
                   </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id}>
                    <td>{log.user}</td>
                    <td>{log.action}</td>
                    <td>{log.module}</td>
                    <td>{new Date(log.created_at).toLocaleString()}</td>
                    <td>{log.ip}</td>
                    <td>{getStatusBadge(log.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={styles.pageButton}
          >
            ← {t('common.previous', 'Anterior')}
          </button>
          <span className={styles.pageInfo}>
            {t('common.page', 'Página')} {page} {t('common.of', 'de')} {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={styles.pageButton}
          >
            {t('common.next', 'Próximo')} →
          </button>
        </div>
      )}
    </div>
  );
};

export default Logs;
