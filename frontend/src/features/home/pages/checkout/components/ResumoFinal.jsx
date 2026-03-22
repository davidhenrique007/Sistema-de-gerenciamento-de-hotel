// =====================================================
// COMPONENTE - RESUMO FINAL DA RESERVA
// =====================================================

import React from 'react';
import styles from '../styles/Checkout.module.css';

const ResumoFinal = ({ quarto, guestData, paymentMethod, total }) => {
  const getPaymentMethodName = (method) => {
    const methods = {
      mpesa: 'M-Pesa',
      emola: 'E-mola',
      mkesh: 'mKesh',
      cartao: 'Cartão de Crédito',
      dinheiro: 'Dinheiro (na chegada)'
    };
    return methods[method] || method;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'MZN'
    }).format(value);
  };

  return (
    <div className={styles.resumoFinal}>
      <h3 className={styles.resumoFinalTitle}>✅ Confirme seus dados</h3>
      
      <div className={styles.resumoFinalGrid}>
        <div className={styles.resumoFinalCard}>
          <h4>🏨 Quarto</h4>
          <p><strong>Número:</strong> {quarto?.numero || 'Não selecionado'}</p>
          <p><strong>Tipo:</strong> {quarto?.tipo || '-'}</p>
          <p><strong>Andar:</strong> {quarto?.andar || '-'}</p>
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
          <p><strong>Valor total:</strong> <span className={styles.totalValue}>{formatCurrency(total)}</span></p>
        </div>
      </div>
    </div>
  );
};

export default ResumoFinal;