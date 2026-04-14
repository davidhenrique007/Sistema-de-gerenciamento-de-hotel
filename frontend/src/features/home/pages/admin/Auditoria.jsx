import React, { useState, useEffect } from 'react';
import LayoutAdmin from './components/LayoutAdmin';
import styles from './Auditoria.module.css';

const Auditoria = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    acao: '',
    dataInicio: '',
    dataFim: ''
  });

  const carregarLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const params = new URLSearchParams();
      if (filtros.acao) params.append('acao', filtros.acao);
      if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
      if (filtros.dataFim) params.append('dataFim', filtros.dataFim);
      
      const url = `http://localhost:5000/api/admin/logs${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setLogs(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarLogs();
  }, [filtros]);

  const getAcaoIcon = (acao) => {
    const icones = {
      CREATE_USER: '➕',
      UPDATE_USER: '✏️',
      DISABLE_USER: '🔴',
      ENABLE_USER: '🟢',
      RESET_PASSWORD: '🔑',
      LOGIN_SUCCESS: '✅',
      LOGIN_FAILURE: '❌',
      ACL_DENIED: '🚫'
    };
    return icones[acao] || '📝';
  };

  const getAcaoCor = (acao) => {
    if (acao.includes('SUCCESS')) return '#10b981';
    if (acao.includes('FAILURE') || acao.includes('DENIED')) return '#ef4444';
    if (acao.includes('CREATE')) return '#3b82f6';
    if (acao.includes('DELETE') || acao.includes('DISABLE')) return '#ef4444';
    return '#f59e0b';
  };

  const getRoleClass = (role) => {
    if (role === 'admin') return styles.admin;
    if (role === 'receptionist') return styles.receptionist;
    if (role === 'financial') return styles.financial;
    return '';
  };

  return (
    <LayoutAdmin>
      <div className={styles.container}>
        <h1 className={styles.title}>Auditoria do Sistema</h1>
        <p className={styles.subtitle}>Histórico completo de ações dos utilizadores</p>

        {/* Filtros */}
        <div className={styles.filtersCard}>
          <div className={styles.filtersGrid}>
            <div className={styles.filterGroup}>
              <label>Ação</label>
              <select
                value={filtros.acao}
                onChange={(e) => setFiltros({ ...filtros, acao: e.target.value })}
                className={styles.filterSelect}
              >
                <option value="">Todas as ações</option>
                <option value="CREATE_USER">Criar Utilizador</option>
                <option value="UPDATE_USER">Editar Utilizador</option>
                <option value="DISABLE_USER">Desativar Utilizador</option>
                <option value="ENABLE_USER">Ativar Utilizador</option>
                <option value="RESET_PASSWORD">Redefinir Senha</option>
                <option value="LOGIN_SUCCESS">Login Sucesso</option>
                <option value="LOGIN_FAILURE">Login Falhou</option>
                <option value="ACL_DENIED">Acesso Negado</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>Data Início</label>
              <input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterGroup}>
              <label>Data Fim</label>
              <input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                className={styles.filterInput}
              />
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Utilizador</th>
                <th>Perfil</th>
                <th>Ação</th>
                <th>Recurso</th>
                <th>IP</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className={styles.loading}>Carregando...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="7" className={styles.empty}>Nenhum log encontrado</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.data_hora).toLocaleString('pt-BR')}</td>
                    <td>{log.usuario_nome || '-'}</td>
                    <td>
                      <span className={`${styles.roleBadge} ${getRoleClass(log.usuario_role)}`}>
                        {log.usuario_role === 'admin' ? 'Admin' : 
                         log.usuario_role === 'receptionist' ? 'Receção' : 
                         log.usuario_role === 'financial' ? 'Financeiro' : '-'}
                      </span>
                    </td>
                    <td style={{ color: getAcaoCor(log.acao) }}>
                      {getAcaoIcon(log.acao)} {log.acao?.replace(/_/g, ' ')}
                    </td>
                    <td>{log.recurso || '-'}</td>
                    <td>{log.ip || '-'}</td>
                    <td>
                      <span className={log.sucesso ? styles.statusSuccess : styles.statusError}>
                        {log.sucesso ? 'Sucesso' : 'Falha'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </LayoutAdmin>
  );
};

export default Auditoria;


