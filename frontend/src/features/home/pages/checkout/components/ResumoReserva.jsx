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
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-MZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    }).format(value);
  };

  const subtotalQuartos = pricePerNight * nights * quantidadeQuartos;
  const subtotalServicos = servicosAdicionais.reduce((sum, s) => sum + (s.preco * nights), 0);
  const subtotal = subtotalQuartos + subtotalServicos;
  const taxas = subtotal * taxaImposto;
  const totalFinal = subtotal + taxas;

  return (
    <div className={styles.resumoCard}>
      <h3 className={styles.resumoTitulo}>Resumo da Reserva</h3>
      
      <div className={styles.resumoLinha}>
        <span>Estadia</span>
        <span>{formatDate(checkIn)} – {formatDate(checkOut)}</span>
      </div>

      <div className={styles.resumoLinha}>
        <span>Hóspedes</span>
        <span>{quantidadeQuartos * 2}</span>
      </div>

      <div className={styles.resumoLinha}>
        <span>Noites</span>
        <span>{nights}</span>
      </div>

      <div className={styles.resumoLinha}>
        <span>Quarto</span>
        <span>{formatCurrency(pricePerNight)} x {nights} noites</span>
      </div>

      {servicosAdicionais.length > 0 && (
        <>
          <h4 style={{ margin: '12px 0 8px', fontSize: '0.9rem' }}>Serviços Adicionais</h4>
          {servicosAdicionais.map(servico => (
            <div key={servico.id} className={styles.resumoLinha}>
              <span>{servico.nome}</span>
              <span>{formatCurrency(servico.preco * nights)} / {nights} noites</span>
            </div>
          ))}
          <div className={styles.resumoLinha}>
            <span>Subtotal serviços</span>
            <span>{formatCurrency(subtotalServicos)}</span>
          </div>
        </>
      )}

      <div className={styles.resumoLinha}>
        <span>Subtotal</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>

      <div className={styles.resumoLinha}>
        <span>Taxas ({taxaImposto * 100}%)</span>
        <span>{formatCurrency(taxas)}</span>
      </div>

      <div className={styles.totalLinha}>
        <span>TOTAL</span>
        <span className={styles.totalValor}>{formatCurrency(totalFinal)}</span>
      </div>
    </div>
  );
};

export default ResumoReserva;
