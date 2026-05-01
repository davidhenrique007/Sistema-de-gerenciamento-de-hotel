import React from 'react';
import styles from '../styles/Checkout.module.css';

const ResumoReserva = ({ 
  tipoQuarto, 
  checkIn, 
  checkOut, 
  nights, 
  pricePerNight, 
  quantidadeQuartos = 1,
  servicosAdicionais = [],
  taxaImposto = 0.05 
}) => {
  const subtotalQuartos = (pricePerNight || 0) * (nights || 1) * quantidadeQuartos;
  const subtotalServicos = servicosAdicionais.reduce((total, servico) => {
    const preco = servico.tipo === 'por_noite' ? (servico.preco || 0) * (nights || 1) : (servico.preco || 0);
    return total + preco;
  }, 0);
  const subtotal = subtotalQuartos + subtotalServicos;
  const taxas = subtotal * (taxaImposto || 0);
  const total = subtotal + taxas;

  const formatarData = (data) => {
    if (!data) return '-';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  };

  const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  return (
    <div className={styles.resumoCard}>
      <div className={styles.resumoHeader}>
        <h3 className={styles.resumoTitle}>📋 Resumo da Reserva</h3>
      </div>
      
      <div className={styles.resumoContent}>
        {/* Quarto */}
        <div className={styles.resumoLinha}>
          <span className={styles.resumoIcon}>🏨</span>
          <div className={styles.resumoInfo}>
            <span className={styles.resumoLabel}>Quarto:</span>
            <span className={styles.resumoValor}>{tipoQuarto || 'Standard'}</span>
          </div>
        </div>

        {/* Check-in */}
        <div className={styles.resumoLinha}>
          <span className={styles.resumoIcon}>📅</span>
          <div className={styles.resumoInfo}>
            <span className={styles.resumoLabel}>Check-in:</span>
            <span className={styles.resumoValor}>{formatarData(checkIn)}</span>
          </div>
        </div>

        {/* Check-out */}
        <div className={styles.resumoLinha}>
          <span className={styles.resumoIcon}>📅</span>
          <div className={styles.resumoInfo}>
            <span className={styles.resumoLabel}>Check-out:</span>
            <span className={styles.resumoValor}>{formatarData(checkOut)}</span>
          </div>
        </div>

        {/* Noites */}
        <div className={styles.resumoLinha}>
          <span className={styles.resumoIcon}>🌙</span>
          <div className={styles.resumoInfo}>
            <span className={styles.resumoLabel}>Noites:</span>
            <span className={styles.resumoValor}>{nights || 1}</span>
          </div>
        </div>

        {/* Quantidade Quartos */}
        <div className={styles.resumoLinha}>
          <span className={styles.resumoIcon}>🛏️</span>
          <div className={styles.resumoInfo}>
            <span className={styles.resumoLabel}>Quartos:</span>
            <span className={styles.resumoValor}>{quantidadeQuartos}</span>
          </div>
        </div>

        {/* Preço por noite */}
        <div className={styles.resumoLinha}>
          <span className={styles.resumoIcon}>💰</span>
          <div className={styles.resumoInfo}>
            <span className={styles.resumoLabel}>Preço/Noite:</span>
            <span className={styles.resumoValor}>{formatarMoeda(pricePerNight)} MZN</span>
          </div>
        </div>

        {/* Linha divisória */}
        <div className={styles.resumoDivisor}></div>

        {/* Subtotal quartos */}
        <div className={styles.resumoLinhaTotal}>
          <span className={styles.resumoIcon}>🏷️</span>
          <div className={styles.resumoInfo}>
            <span className={styles.resumoLabel}>Subtotal quartos:</span>
            <span className={styles.resumoValor}>{formatarMoeda(subtotalQuartos)} MZN</span>
          </div>
        </div>

        {/* Serviços adicionais */}
        {servicosAdicionais.length > 0 && (
          <div className={styles.resumoLinhaServico}>
            <span className={styles.resumoIcon}>✨</span>
            <div className={styles.resumoInfo}>
              <span className={styles.resumoLabel}>Serviços:</span>
              <span className={styles.resumoValor}>{formatarMoeda(subtotalServicos)} MZN</span>
            </div>
          </div>
        )}

        {/* TOTAL */}
        <div className={styles.resumoLinhaGrandeTotal}>
          <span className={styles.resumoIcon}>🎯</span>
          <div className={styles.resumoInfo}>
            <span className={styles.resumoLabelTotal}>TOTAL:</span>
            <span className={styles.resumoValorTotal}>{formatarMoeda(total)} MZN</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumoReserva;
