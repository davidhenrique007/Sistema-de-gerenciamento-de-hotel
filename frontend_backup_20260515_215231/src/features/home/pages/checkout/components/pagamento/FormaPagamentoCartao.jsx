// =====================================================
// COMPONENTE - PAGAMENTO COM CARTÃO DE CRÉDITO
// =====================================================

import React from 'react';
import styles from '../../styles/Checkout.module.css';

const FormaPagamentoCartao = ({ paymentDetails, setPaymentDetails, errors }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Máscara para cartão
    if (name === 'cardNumber') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{4})(?=\d)/g, '$1 ')
        .slice(0, 19);
    }
    
    // Máscara para validade
    if (name === 'expiry') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(?=\d)/g, '$1/')
        .slice(0, 5);
    }
    
    // CVV só números
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }
    
    setPaymentDetails(prev => ({ ...prev, [name]: formattedValue }));
  };

  const detectCardType = (number) => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'Visa';
    if (cleaned.startsWith('5')) return 'Mastercard';
    if (cleaned.startsWith('3')) return 'Amex';
    return 'Cartão';
  };

  return (
    <div className={styles.paymentMethodContent}>
      <div className={styles.cardType}>
        {paymentDetails.cardNumber && (
          <span className={styles.cardTypeBadge}>
            {detectCardType(paymentDetails.cardNumber)}
          </span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="cardNumber">Número do cartão</label>
        <input
          type="text"
          id="cardNumber"
          name="cardNumber"
          value={paymentDetails.cardNumber || ''}
          onChange={handleChange}
          placeholder="0000 0000 0000 0000"
          className={`${styles.input} ${errors?.payment ? styles.inputError : ''}`}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="cardHolder">Nome no cartão</label>
        <input
          type="text"
          id="cardHolder"
          name="cardHolder"
          value={paymentDetails.cardHolder || ''}
          onChange={handleChange}
          placeholder="Como aparece no cartão"
          className={styles.input}
        />
      </div>

      <div className={styles.rowFields}>
        <div className={styles.formGroup}>
          <label htmlFor="expiry">Validade</label>
          <input
            type="text"
            id="expiry"
            name="expiry"
            value={paymentDetails.expiry || ''}
            onChange={handleChange}
            placeholder="MM/AA"
            className={`${styles.input} ${errors?.payment ? styles.inputError : ''}`}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="cvv">CVV</label>
          <input
            type="text"
            id="cvv"
            name="cvv"
            value={paymentDetails.cvv || ''}
            onChange={handleChange}
            placeholder="123"
            className={`${styles.input} ${errors?.payment ? styles.inputError : ''}`}
          />
        </div>
      </div>

      {errors?.payment && (
        <span className={styles.errorMessage}>{errors.payment}</span>
      )}

      <div className={styles.simulateButton}>
        <button className={styles.mockButton} type="button">
          Simular Pagamento (Demo)
        </button>
        <p className={styles.mockHint}>
          Use 4242 4242 4242 4242 para teste | CVV: 123
        </p>
      </div>
    </div>
  );
};

export default FormaPagamentoCartao;