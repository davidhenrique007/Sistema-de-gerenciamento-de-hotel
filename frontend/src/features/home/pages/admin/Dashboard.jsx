import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LayoutAdmin from './components/LayoutAdmin';
import CardMetrica from './components/CardMetrica';
import HeatmapOcupacao from './components/HeatmapOcupacao';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const carregarMetricas = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        console.error('❌ Token não encontrado');
        navigate('/login-admin');
        return;
      }
      
      console.log('🔑 Carregando métricas com token...');
      
      const response = await fetch('http://localhost:5000/api/admin/dashboard/metrics', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        console.error('❌ Token inválido ou expirado');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        navigate('/login-admin');
        return;
      }
      
      const data = await response.json();
      console.log('📊 Dados recebidos:', data);
      
      if (data.success) {
        setMetrics(data.data);
        setError(null);
      } else {
        setError(data.message || 'Erro ao carregar métricas');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar métricas:', err);
      setError('Não foi possível carregar as métricas');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    carregarMetricas();
    
    // Polling a cada 30 segundos
    const interval = setInterval(carregarMetricas, 30000);
    
    return () => clearInterval(interval);
  }, [carregarMetricas]);

  const adminUserStr = localStorage.getItem('admin_user');
  let userName = 'Admin';
  try {
    if (adminUserStr) {
      const user = JSON.parse(adminUserStr);
      userName = user?.name?.split(' ')[0] || 'Admin';
    }
  } catch (e) {
    console.error('Erro ao parsear usuário:', e);
  }

  if (loading) {
    return (
      <LayoutAdmin>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Carregando dashboard...</p>
        </div>
      </LayoutAdmin>
    );
  }

  if (error) {
    return (
      <LayoutAdmin>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <button onClick={carregarMetricas} className={styles.retryButton}>
            Tentar novamente
          </button>
        </div>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <div className={styles.dashboard}>
        <div className={styles.welcomeSection}>
          <h2 className={styles.welcomeTitle}>
            Bem-vindo, {userName}!
          </h2>
          <p className={styles.welcomeSubtitle}>
            Aqui está o resumo das operações do hotel
          </p>
        </div>

        <div className={styles.metricsGrid}>
          <CardMetrica
            titulo="Reservas Hoje"
            valor={metrics?.reservasHoje || 0}
            icone="📅"
            cor="blue"
            variacao={metrics?.variacaoPercentual}
            loading={loading}
          />
          <CardMetrica
            titulo="Reservas no Mês"
            valor={metrics?.reservasMes || 0}
            icone="📊"
            cor="purple"
            loading={loading}
          />
          <CardMetrica
            titulo="Quartos Ocupados"
            valor={metrics?.quartosOcupados || 0}
            icone="🏨"
            cor="orange"
            loading={loading}
          />
          <CardMetrica
            titulo="Quartos Disponíveis"
            valor={metrics?.quartosDisponiveis || 0}
            icone="✅"
            cor="green"
            loading={loading}
          />
          <CardMetrica
            titulo="Receita Hoje"
            valor={metrics?.receitaDia || 0}
            icone="💰"
            cor="green"
            loading={loading}
          />
          <CardMetrica
            titulo="Receita no Mês"
            valor={metrics?.receitaMes || 0}
            icone="💵"
            cor="blue"
            loading={loading}
          />
          <CardMetrica
            titulo="Taxa de Ocupação"
            valor={`${metrics?.taxaOcupacao || 0}%`}
            icone="📈"
            cor="purple"
            loading={loading}
          />
        </div>

        <div className={styles.heatmapSection}>
          <h3 className={styles.sectionTitle}>Mapa de Ocupação</h3>
          <p className={styles.sectionSubtitle}>
            Ocupação por tipo de quarto e disponibilidade
          </p>
          <HeatmapOcupacao />
        </div>

        <div className={styles.updateInfo}>
          <span className={styles.updateIcon}>🔄</span>
          <span className={styles.updateText}>
            Última atualização: {metrics?.ultimaAtualizacao ? new Date(metrics.ultimaAtualizacao).toLocaleTimeString('pt-BR') : 'agora'}
          </span>
        </div>
      </div>
    </LayoutAdmin>
  );
};

export default Dashboard;
