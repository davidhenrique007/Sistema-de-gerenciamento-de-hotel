// =====================================================
// COMPONENTE - PAGAMENTO EM DINHEIRO
// =====================================================

import React from 'react';
import styles from '../../styles/Checkout.module.css';

const FormaPagamentoDinheiro = () => {
  return (
    <div className={styles.paymentMethodContent}>
      <div className={styles.cashInfo}>
        <div className={styles.cashIcon}>💵</div>
        <h3 className={styles.cashTitle}>Pagamento na chegada</h3>
        <p className={styles.cashDescription}>
          Você poderá pagar diretamente na recepção do hotel na data do check-in.
        </p>
        
        <div className={styles.cashWarning}>
          <span className={styles.warningIcon}>⚠️</span>
          <div>
            <strong>Importante:</strong>
            <ul>
              <li>Reserva será confirmada após o pagamento</li>
              <li>Prazo de cancelamento: 24h antes do check-in</li>
              <li>Em caso de não comparecimento, o quarto será liberado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormaPagamentoDinheiro;