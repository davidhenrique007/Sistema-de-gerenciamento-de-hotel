import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import styles from './SegurancaTab.module.css';

const SegurancaTab = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, logout, sessionTimeLeft, lastActivity, deviceInfo } = useAuth();
  const { hasRole, getUserRole } = usePermissions();
  const [logsPreview, setLogsPreview] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const formatTimeLeft = () => {
    if (!sessionTimeLeft) return '--:--';
    const minutes = Math.floor(sessionTimeLeft / 60000);
    const seconds = Math.floor((sessionTimeLeft % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatLastActivity = () => {
    if (!lastActivity) return t('seguranca.agora', 'Agora');
    const diff = Date.now() - lastActivity;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return t('seguranca.agora', 'Agora');
    if (minutes === 1) return `${minutes} ${t('seguranca.minuto', 'minuto')}`;
    return `${minutes} ${t('seguranca.minutos', 'minutos')}`;
  };

  const handleLogoutAll = () => {
    if (window.confirm(t('seguranca.confirmar_logout', 'Tem certeza que deseja encerrar sua sessão?'))) {
      logout();
      navigate('/login-admin');
    }
  };

  const handleViewLogs = () => {
    navigate('/admin/logs');
  };

  const handleChangePassword = () => {
    alert(t('seguranca.alterar_senha_em_breve', 'Funcionalidade em breve'));
  };

  useEffect(() => {
    const loadPreviewLogs = async () => {
      setLoadingLogs(true);
      try {
        const response = await fetch('/api/admin/logs?limit=3');
        if (response.ok) {
          const data = await response.json();
          setLogsPreview(data.data || []);
        }
      } catch (error) {
        console.error('Erro ao carregar preview de logs:', error);
      } finally {
        setLoadingLogs(false);
      }
    };
    loadPreviewLogs();
  }, []);

  const userRole = getUserRole();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {t('configuracoes.seguranca', 'Segurança')}
        </h2>
        <p className={styles.description}>
          {t('configuracoes.seguranca_desc', 'Gerencie políticas de segurança e permissões do sistema')}
        </p>
      </div>

      <div className={styles.securityGrid}>
        {/* Sessão Atual */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>🕒</span>
            <div>
              <h3 className={styles.cardTitle}>
                {t('seguranca.sessao_atual', 'Sessão Atual')}
              </h3>
              <p className={styles.cardDescription}>
                {t('seguranca.sessao_desc', 'Informações da sua sessão atual')}
              </p>
            </div>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>{t('seguranca.usuario', 'Usuário')}:</span>
              <span className={styles.infoValue}>{user?.name || 'Admin'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>{t('seguranca.perfil', 'Perfil')}:</span>
              <span className={`${styles.roleBadge} ${styles[userRole]}`}>
                {userRole === 'admin' ? 'Administrador' : 
                 userRole === 'receptionist' ? 'Recepcionista' : 
                 userRole === 'financial' ? 'Financeiro' : userRole}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>{t('seguranca.tempo_restante', 'Tempo restante')}:</span>
              <span className={styles.timeValue}>{formatTimeLeft()}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>{t('seguranca.ultima_atividade', 'Última atividade')}:</span>
              <span>{formatLastActivity()}</span>
            </div>
            {deviceInfo && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>{t('seguranca.dispositivo', 'Dispositivo')}:</span>
                <span>{deviceInfo}</span>
              </div>
            )}
            <button onClick={handleLogoutAll} className={styles.logoutButton}>
              {t('seguranca.encerrar_sessao', 'Encerrar Sessão')}
            </button>
          </div>
        </div>

        {/* Segurança da Conta */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>🔑</span>
            <div>
              <h3 className={styles.cardTitle}>
                {t('seguranca.seguranca_conta', 'Segurança da Conta')}
              </h3>
              <p className={styles.cardDescription}>
                {t('seguranca.seguranca_desc', 'Gerencie a segurança da sua conta')}
              </p>
            </div>
          </div>
          <div className={styles.cardContent}>
            <button onClick={handleChangePassword} className={styles.actionButton}>
              <span className={styles.actionIcon}>🔒</span>
              <div className={styles.actionInfo}>
                <span className={styles.actionTitle}>{t('seguranca.alterar_senha', 'Alterar Senha')}</span>
                <span className={styles.actionDesc}>{t('seguranca.alterar_senha_desc', 'Atualize sua senha regularmente')}</span>
              </div>
              <span className={styles.actionArrow}>→</span>
            </button>
            
            <div className={`${styles.actionButton} ${styles.disabled}`}>
              <span className={styles.actionIcon}>📱</span>
              <div className={styles.actionInfo}>
                <span className={styles.actionTitle}>{t('seguranca.autenticacao_dois_fatores', 'Autenticação de Dois Fatores')}</span>
                <span className={styles.actionDesc}>{t('seguranca.2fa_desc', 'Adicione uma camada extra de segurança')}</span>
              </div>
              <span className={styles.comingSoonBadge}>{t('configuracoes.em_breve', 'Em breve')}</span>
            </div>
          </div>
        </div>

        {/* Permissões */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>🛡️</span>
            <div>
              <h3 className={styles.cardTitle}>
                {t('seguranca.permissoes', 'Permissões')}
              </h3>
              <p className={styles.cardDescription}>
                {t('seguranca.permissoes_desc', 'Seu nível de acesso no sistema')}
              </p>
            </div>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.permissionsList}>
              <div className={`${styles.permissionItem} ${hasRole('admin') ? styles.allowed : ''}`}>
                <span className={styles.permissionIcon}>👑</span>
                <span className={styles.permissionName}>{t('seguranca.acesso_total', 'Acesso Total')}</span>
                {hasRole('admin') && <span className={styles.permissionStatus}>✓</span>}
              </div>
              <div className={`${styles.permissionItem} ${hasRole('admin') || hasRole('receptionist') ? styles.allowed : ''}`}>
                <span className={styles.permissionIcon}>🏨</span>
                <span className={styles.permissionName}>{t('seguranca.gerenciar_reservas', 'Gerenciar Reservas')}</span>
                {(hasRole('admin') || hasRole('receptionist')) && <span className={styles.permissionStatus}>✓</span>}
              </div>
              <div className={`${styles.permissionItem} ${hasRole('admin') || hasRole('financial') ? styles.allowed : ''}`}>
                <span className={styles.permissionIcon}>💰</span>
                <span className={styles.permissionName}>{t('seguranca.gerenciar_financeiro', 'Gerenciar Financeiro')}</span>
                {(hasRole('admin') || hasRole('financial')) && <span className={styles.permissionStatus}>✓</span>}
              </div>
              <div className={`${styles.permissionItem} ${hasRole('admin') ? styles.allowed : ''}`}>
                <span className={styles.permissionIcon}>⚙️</span>
                <span className={styles.permissionName}>{t('seguranca.gerenciar_configuracoes', 'Gerenciar Configurações')}</span>
                {hasRole('admin') && <span className={styles.permissionStatus}>✓</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Auditoria */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>📜</span>
            <div>
              <h3 className={styles.cardTitle}>
                {t('seguranca.auditoria', 'Auditoria')}
              </h3>
              <p className={styles.cardDescription}>
                {t('seguranca.auditoria_desc', 'Acompanhe as atividades do sistema')}
              </p>
            </div>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.logsPreview}>
              <h4 className={styles.logsTitle}>{t('seguranca.atividades_recentes', 'Atividades Recentes')}</h4>
              {loadingLogs ? (
                <div className={styles.logsLoading}>{t('common.loading', 'Carregando...')}</div>
              ) : logsPreview.length > 0 ? (
                logsPreview.map(log => (
                  <div key={log.id} className={styles.logItem}>
                    <span className={styles.logUser}>{log.user}</span>
                    <span className={styles.logAction}>{log.action}</span>
                    <span className={styles.logDate}>{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <div className={styles.logsEmpty}>{t('seguranca.nenhuma_atividade', 'Nenhuma atividade recente')}</div>
              )}
              <button onClick={handleViewLogs} className={styles.viewLogsButton}>
                {t('seguranca.ver_todos_logs', 'Ver todos os logs')} →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SegurancaTab;