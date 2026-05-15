// frontend/src/features/home/pages/admin/components/reservas/DetalheReserva.jsx
import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiCalendar, FiDollarSign, FiPackage, FiClock } from 'react-icons/fi';
import api from '../../../../../../services/api';
import styles from './DetalheReserva.module.css';

const DetalheReserva = ({ reservaId }) => {
  const [detalhes, setDetalhes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDetalhes = async () => {
      try {
        const response = await api.get(`/admin/reservas/${reservaId}/detalhes`);
        if (response.data.success) {
          setDetalhes(response.data.data);
        }
      } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDetalhes();
  }, [reservaId]);

  if (loading) {
    return (
      <div className={styles.skeletonDetails}>
        <div className={styles.skeletonCard}>
          <div className={`${styles.skeletonLine} ${styles.skeletonLineMedium}`}></div>
          <div className={styles.skeletonLine}></div>
          <div className={styles.skeletonLine}></div>
        </div>
      </div>
    );
  }

  if (!detalhes) {
    return (
      <div className={styles.emptyState}>
        <p>NÃ£o foi possÃ­vel carregar os detalhes da reserva</p>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "-";
    const numero = parseFloat(value);
    if (isNaN(numero)) return "-";
    return new Intl.NumberFormat("pt-MZ", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numero) + " MTn";
  };

  return (
    <div className={styles.detailsContainer}>
      <div className={styles.detailsGrid}>
        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <FiUser className={`${styles.cardIcon} ${styles.iconBlue}`} />
            <h3 className={styles.cardTitle}>Dados do HÃ³spede</h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Nome:</span>
              <span className={styles.infoValue}>{detalhes.cliente_nome}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email:</span>
              <span className={styles.infoValue}>{detalhes.cliente_email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Telefone:</span>
              <span className={styles.infoValue}>{detalhes.cliente_telefone}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Documento:</span>
              <span className={styles.infoValue}>{detalhes.cliente_documento}</span>
            </div>
          </div>
        </div>

        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <FiCalendar className={`${styles.cardIcon} ${styles.iconGreen}`} />
            <h3 className={styles.cardTitle}>Detalhes da Reserva</h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>CÃ³digo:</span>
              <span className={styles.infoValue}>{detalhes.codigo_reserva}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Check-in:</span>
              <span className={styles.infoValue}>{formatDate(detalhes.data_checkin)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Check-out:</span>
              <span className={styles.infoValue}>{formatDate(detalhes.data_checkout)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Quarto:</span>
              <span className={styles.infoValue}>{detalhes.quarto_numero} - {detalhes.quarto_tipo}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>MÃ©todo Pagamento:</span>
              <span className={styles.infoValue}>{detalhes.metodo_pagamento || 'NÃ£o informado'}</span>
            </div>
          </div>
        </div>

        {detalhes.acompanhantes && detalhes.acompanhantes.length > 0 && (
          <div className={styles.detailCard}>
            <div className={styles.cardHeader}>
              <FiPackage className={`${styles.cardIcon} ${styles.iconPurple}`} />
              <h3 className={styles.cardTitle}>Acompanhantes</h3>
            </div>
            <div className={styles.acompanhantesList}>
              {detalhes.acompanhantes.map((acompanhante, index) => (
                <div key={index} className={styles.acompanhanteItem}>
                  <div className={styles.acompanhanteNome}>{acompanhante.nome}</div>
                  <div className={styles.acompanhanteDocumento}>Doc: {acompanhante.documento}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {detalhes.extras && detalhes.extras.length > 0 && (
          <div className={styles.detailCard}>
            <div className={styles.cardHeader}>
              <FiDollarSign className={`${styles.cardIcon} ${styles.iconYellow}`} />
              <h3 className={styles.cardTitle}>Extras Consumidos</h3>
            </div>
            <div className={styles.extrasList}>
              {detalhes.extras.map((extra, index) => (
                <div key={index} className={styles.extraItem}>
                  <div className={styles.extraInfo}>
                    <span className={styles.extraNome}>{extra.nome}</span>
                    <span className={styles.extraQuantidade}>Qtd: {extra.quantidade}</span>
                  </div>
                  <span className={styles.extraValor}>{formatCurrency(extra.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {detalhes.historico_status && detalhes.historico_status.length > 0 && (
          <div className={styles.detailCard}>
            <div className={styles.cardHeader}>
              <FiClock className={`${styles.cardIcon} ${styles.iconOrange}`} />
              <h3 className={styles.cardTitle}>HistÃ³rico de Status</h3>
            </div>
            <div className={styles.timeline}>
              {detalhes.historico_status.map((historico, index) => (
                <div key={index} className={styles.timelineItem}>
                  <div className={styles.timelineDot}></div>
                  <div className={styles.timelineStatus}>{historico.status}</div>
                  <div className={styles.timelineDescription}>{historico.descricao}</div>
                  <div className={styles.timelineDate}>{historico.data_alteracao}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {detalhes.observacoes && (
        <div className={styles.observationsBox}>
          <div className={styles.observationsTitle}>ObservaÃ§Ãµes</div>
          <div className={styles.observationsText}>{detalhes.observacoes}</div>
        </div>
      )}

      <div className={styles.totalBox}>
        <div className={styles.totalContent}>
          <span className={styles.totalLabel}>Valor Total da Reserva</span>
          <span className={styles.totalValue}>
            {formatCurrency(parseFloat(detalhes.valor_total) + parseFloat(detalhes.valor_extras || 0))}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DetalheReserva;

