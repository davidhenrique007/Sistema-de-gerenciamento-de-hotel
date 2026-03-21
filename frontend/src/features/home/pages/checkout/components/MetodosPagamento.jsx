import React, { useState } from 'react';
import styles from '../styles/Checkout.module.css';

const MetodosPagamento = () => {
  const [metodo, setMetodo] = useState('');

  const methods = ['M-Pesa', 'Cartão', 'Dinheiro'];

  return (
    <div className={styles.paymentMethods}>
      {methods.map((method) => (
        <label key={method} className={styles.methodLabel}>
          <input
            type="radio"
            name="paymentMethod"
            value={method.toLowerCase()}
            checked={metodo === method.toLowerCase()}
            onChange={() => setMetodo(method.toLowerCase())}
            className={styles.radioInput}
          />
          <span className={styles.methodText}>{method}</span>
        </label>
      ))}
    </div>
  );
};

export default MetodosPagamento;
