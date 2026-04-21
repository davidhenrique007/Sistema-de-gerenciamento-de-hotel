import React from 'react';
import styles from '../styles/Checkout.module.css';

const ResumoFinal = ({ 
  quartos, 
  guestData, 
  paymentMethod, 
  nights,
  pricePerNight,
  servicosAdicionais = [],
  taxaImposto = 0.05
}) => {
  const getPaymentMethodName = (method) => {
    const methods = {
      mpesa: 'M-Pesa',
      emola: 'E-mola',
      mkesh: 'mKesh',
      cartao: 'Cartão de Crédito',
      dinheiro: 'Dinheiro (na chegada)'
    };
    return methods[method] || method || 'Não selecionado';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    }).format(value);
  };

  const subtotalQuartos = pricePerNight * nights * (quartos?.length || 1);
  const subtotalServicos = servicosAdicionais.reduce((sum, s) => sum + (s.preco * nights), 0);
  const subtotal = subtotalQuartos + subtotalServicos;
  const taxas = subtotal * taxaImposto;
  const total = subtotal + taxas;

  return (
    <div className={styles.resumoFinal}>
      <h3 className={styles.resumoFinalTitle}>✅ Confirme seus dados</h3>
      
      <div className={styles.resumoFinalGrid}>
        <div className={styles.resumoFinalCard}>
          <h4>🏨 Quartos Selecionados</h4>
          {quartos && quartos.length > 0 ? (
            <>
              {quartos.map(quarto => (
                <p key={quarto.id}>
                  <strong>Quarto {quarto.numero}</strong> - {quarto.tipo}
                </p>
              ))}
              <p className={styles.totalQuartosResumo}>
                <strong>Total:</strong> {quartos.length} quarto(s) | {nights} noite(s)
              </p>
              <p><strong>Subtotal quartos:</strong> {formatCurrency(subtotalQuartos)}</p>
            </>
          ) : (
            <p>Nenhum quarto selecionado</p>
          )}
        </div>
        
        <div className={styles.resumoFinalCard}>
          <h4>👤 Hóspede</h4>
          <p><strong>Nome:</strong> {guestData.nome}</p>
          <p><strong>Telefone:</strong> {guestData.telefone}</p>
          {guestData.documento && <p><strong>Documento:</strong> {guestData.documento}</p>}
        </div>
        
        <div className={styles.resumoFinalCard}>
          <h4>💳 Pagamento</h4>
          <p><strong>Método:</strong> {getPaymentMethodName(paymentMethod)}</p>
          {servicosAdicionais.length > 0 && (
            <p><strong>Serviços:</strong> {formatCurrency(subtotalServicos)}</p>
          )}
          <p><strong>Taxas ({taxaImposto * 100}%):</strong> {formatCurrency(taxas)}</p>
          <p><strong>Valor total:</strong> <span className={styles.totalValue}>{formatCurrency(total)}</span></p>
        </div>
      </div>
    </div>
  );
};

export default ResumoFinal;