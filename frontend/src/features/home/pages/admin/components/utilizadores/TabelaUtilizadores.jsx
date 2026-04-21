import React, { useState } from 'react';
import { FiEdit2, FiRefreshCw, FiUserCheck, FiUserX } from 'react-icons/fi';
import styles from './TabelaUtilizadores.module.css';

const TabelaUtilizadores = ({ utilizadores, loading, pagination, onPageChange, onLimitChange, onEditar, onRefresh }) => {
  const [resetando, setResetando] = useState(null);

  const getRoleBadge = (role) => {
    const badges = {
      admin: { label: 'Administrador', class: styles.badgeAdmin },
      receptionist: { label: 'Rececionista', class: styles.badgeReceptionist },
      financial: { label: 'Financeiro', class: styles.badgeFinancial }
    };
    return badges[role] || { label: role, class: styles.badgeDefault };
  };

  const getStatusBadge = (isActive) => {
    return isActive 
      ? { label: 'Ativo', class: styles.badgeActive }
      : { label: 'Inativo', class: styles.badgeInactive };
  };

  const formatarDataHora = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleResetSenha = async (id, name) => {
    if (!window.confirm(`Deseja redefinir a senha do utilizador ${name}? Uma senha temporária será enviada por email.`)) {
      return;
    }

    setResetando(id);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`http://localhost:5000/api/admin/utilizadores/${id}/reset-senha`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        alert('Senha redefinida com sucesso! Email enviado.');
        onRefresh();
      } else {
        alert(data.message || 'Erro ao redefinir senha');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao redefinir senha');
    } finally {
      setResetando(null);
    }
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

  if (utilizadores.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>👥</div>
        <h3>Nenhum utilizador encontrado</h3>
        <p>Tente ajustar os filtros ou adicione um novo utilizador</p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Perfil</th>
              <th>Estado</th>
              <th>Último Login</th>
              <th>Último Logout</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {utilizadores.map((user) => {
              const roleBadge = getRoleBadge(user.role);
              const statusBadge = getStatusBadge(user.is_active);
              return (
                <tr key={user.id} className={styles.tableRow}>
                  <td className={styles.userName}>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone || '-'}</td>
                  <td><span className={roleBadge.class}>{roleBadge.label}</span></td>
                  <td><span className={statusBadge.class}>{statusBadge.label}</span></td>
                  <td>{formatarDataHora(user.last_login)}</td>
                  <td>{formatarDataHora(user.last_logout)}</td>
                  <td className={styles.actionsCell}>
                    <button onClick={() => onEditar(user)} className={styles.actionButton} title="Editar">
                      <FiEdit2 />
                    </button>
                    <button onClick={() => handleResetSenha(user.id, user.name)} disabled={resetando === user.id} className={styles.actionButton} title="Redefinir Senha">
                      <FiRefreshCw className={resetando === user.id ? styles.spinning : ''} />
                    </button>
                    {user.is_active ? (
                      <button className={`${styles.actionButton} ${styles.disabled}`} title="Ativo" disabled>
                        <FiUserCheck />
                      </button>
                    ) : (
                      <button className={`${styles.actionButton} ${styles.inactive}`} title="Inativo" disabled>
                        <FiUserX />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.paginationContainer}>
        <div className={styles.limitSelector}>
          <span>Mostrar</span>
          <select value={pagination.limit} onChange={(e) => onLimitChange(parseInt(e.target.value))} className={styles.limitSelect}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>por página</span>
        </div>
        
        <div className={styles.paginationControls}>
          <button onClick={() => onPageChange(pagination.page - 1)} disabled={pagination.page === 1} className={styles.paginationButton}>Anterior</button>
          <span className={styles.pageInfo}>Página {pagination.page} de {pagination.pages}</span>
          <button onClick={() => onPageChange(pagination.page + 1)} disabled={pagination.page === pagination.pages} className={styles.paginationButton}>Próxima</button>
        </div>
      </div>
    </div>
  );
};

export default TabelaUtilizadores;
