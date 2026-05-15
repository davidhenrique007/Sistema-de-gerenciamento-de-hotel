// frontend/src/features/home/pages/admin/Reservas.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FiDownload, FiRefreshCw } from 'react-icons/fi';
import LayoutAdmin from './components/LayoutAdmin';
import TabelaReservas from './components/reservas/TabelaReservas';
import FiltrosReservas from './components/reservas/FiltrosReservas';
import * as XLSX from 'xlsx';
import api from '../../../../services/api';
import styles from './Reservas.module.css';

const Reservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    search: '',
    phone: '',
    checkInFrom: '',
    checkInTo: '',
    paymentStatus: '',
    roomType: '',
    roomNumber: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [summary, setSummary] = useState({
    todayReservations: 0,
    pendingCheckins: 0,
    latePayments: 0
  });

  const carregarReservas = useCallback(async () => {
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

      const response = await fetch(`http://localhost:5000/api/admin/reservas?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setReservas(data.data || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 0
        }));
        setSummary(data.summary || {
          todayReservations: 0,
          pendingCheckins: 0,
          latePayments: 0
        });
      }
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filtros]);

  useEffect(() => {
    carregarReservas();
  }, [carregarReservas]);

  const handleFiltroChange = (novosFiltros) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleLimparFiltros = () => {
    setFiltros({
      search: '',
      phone: '',
      checkInFrom: '',
      checkInTo: '',
      paymentStatus: '',
      roomType: '',
      roomNumber: '',
      status: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleExportarExcel = () => {
    if (reservas.length === 0) return;
    
    const dadosExportacao = reservas.map(reserva => ({
      'Código': reserva.codigo_reserva,
      'Cliente': reserva.cliente_nome,
      'Telefone': reserva.cliente_telefone,
      'Quarto': reserva.quarto_numero,
      'Tipo': reserva.quarto_tipo,
      'Check-in': new Date(reserva.data_checkin).toLocaleDateString('pt-BR'),
      'Check-out': new Date(reserva.data_checkout).toLocaleDateString('pt-BR'),
      'Status Pagamento': reserva.status_pagamento,
      'Valor Total': `R$ ${parseFloat(reserva.valor_total).toFixed(2)}`,
      'Status': reserva.status_reserva
    }));

    const ws = XLSX.utils.json_to_sheet(dadosExportacao);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reservas');
    
    const data = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `reservas-filtradas-${data}.xlsx`);
  };

  const cards = [
    {
      titulo: 'Reservas Hoje',
      valor: summary.todayReservations,
      tipo: 'blue',
      icone: '📅'
    },
    {
      titulo: 'Check-ins Pendentes',
      valor: summary.pendingCheckins,
      tipo: 'yellow',
      icone: '🛎️'
    },
    {
      titulo: 'Pagamentos Atrasados',
      valor: summary.latePayments,
      tipo: 'red',
      icone: '💳'
    }
  ];

  const getCardClass = (tipo) => {
    switch(tipo) {
      case 'blue': return `${styles.kpiCard} ${styles.cardBlue}`;
      case 'yellow': return `${styles.kpiCard} ${styles.cardYellow}`;
      case 'red': return `${styles.kpiCard} ${styles.cardRed}`;
      default: return styles.kpiCard;
    }
  };

  // ✅ Agora usando LayoutAdmin (igual ao Dashboard)
  return (
    <LayoutAdmin>
      <div className={styles.reservasContainer}>
        <div className={styles.contentWrapper}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Gestão de Reservas</h1>
            <p className={styles.pageSubtitle}>Gerencie todas as reservas do hotel</p>
          </div>

          <div className={styles.cardsGrid}>
            {cards.map((card, index) => (
              <div key={index} className={getCardClass(card.tipo)}>
                <div className={styles.kpiHeader}>
                  <span className={styles.cardIcon}>{card.icone}</span>
                  <span className={styles.cardValue}>{card.valor}</span>
                </div>
                <div className={styles.kpiFooter}>
                  <h3 className={styles.kpiTitle}>{card.titulo}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.filtersSection}>
            <div className={styles.filtersHeader}>
              <h2 className={styles.filtersTitle}>Filtros</h2>
              <div className={styles.filtersActions}>
                <button onClick={handleLimparFiltros} className={styles.clearButton}>
                  <FiRefreshCw /> Limpar
                </button>
                <button onClick={handleExportarExcel} className={styles.exportButton}>
                  <FiDownload /> Exportar Excel
                </button>
              </div>
            </div>
            <FiltrosReservas filtros={filtros} onFiltroChange={handleFiltroChange} />
          </div>

          <div className={styles.tableContainer}>
            <TabelaReservas
              reservas={reservas}
              loading={loading}
              pagination={pagination}
              onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
              onLimitChange={(limit) => setPagination(prev => ({ ...prev, limit, page: 1 }))}
            />
          </div>
        </div>
      </div>
    </LayoutAdmin>
  );
};

export default Reservas;