// =====================================================
// HOTEL PARADISE - PERFIL DO CLIENTE
// Versão: 1.0.0
// =====================================================

import React from 'react';
import { useCliente } from '../hooks/useCliente';
import LogoutButton from '../components/LogoutButton';
import styles from './PerfilCliente.module.css';

const PerfilCliente = () => {
  const { 
    cliente, 
    loading, 
    tempoSessao, 
    ultimaAtualizacao,
    logoutCliente 
  } = useCliente();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!cliente) {
    return <div>Cliente não encontrado</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Meu Perfil</h1>
      
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.avatar}>
            {cliente.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2>{cliente.name}</h2>
            <p>Cliente desde {new Date(cliente.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className={styles.info}>
          <div className={styles.field}>
            <label>Telefone:</label>
            <span>{cliente.phone}</span>
          </div>
          
          {cliente.email && (
            <div className={styles.field}>
              <label>E-mail:</label>
              <span>{cliente.email}</span>
            </div>
          )}
          
          {cliente.document && (
            <div className={styles.field}>
              <label>Documento:</label>
              <span>{cliente.document}</span>
            </div>
          )}

          <div className={styles.field}>
            <label>Sessão ativa há:</label>
            <span>{tempoSessao}</span>
          </div>

          <div className={styles.field}>
            <label>Última atividade:</label>
            <span>{ultimaAtualizacao?.toLocaleTimeString()}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <LogoutButton variant="default" />
        </div>
      </div>
    </div>
  );
};

export default PerfilCliente;