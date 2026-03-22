// =====================================================
// COMPONENTE - PAGAMENTO MÓVEL (M-Pesa / E-mola / mKesh)
// =====================================================

import React, { useState } from 'react';
import { mascaraTelefone, removerMascara } from '../../../../../../shared/utils/mascaras';
import styles from '../../styles/Checkout.module.css';

const FormaPagamentoMPesa = ({ paymentDetails, setPaymentDetails, errors }) => {
  const [operadora, setOperadora] = useState('mpesa');

  const operadoras = [
    { id: 'mpesa', label: 'M-Pesa', prefixos: ['84', '85'] },
    { id: 'emola', label: 'E-mola', prefixos: ['86', '87'] },
    { id: 'mkesh', label: 'mKesh', prefixos: ['82', '83'] }
  ];

  const handlePhoneChange = (e) => {
    const valor = e.target.value;
    const mascara = mascaraTelefone(valor);
    setPaymentDetails({ phone: mascara });
    
    // Detectar operadora baseado no prefixo
    const numeros = removerMascara(mascara);
    if (numeros.length >= 2) {
      const prefixo = numeros.substring(0, 2);
      const operadoraEncontrada = operadoras.find(op => op.prefixos.includes(prefixo));
      if (operadoraEncontrada) {
        setOperadora(operadoraEncontrada.id);
      }
    }
  };

  return (
    <div className={styles.paymentMethodContent}>
      <div className={styles.operadoraInfo}>
        <div className={styles.operadoraBadge}>
          {operadora === 'mpesa' && '📱 M-Pesa'}
          {operadora === 'emola' && '📱 E-mola'}
          {operadora === 'mkesh' && '📱 mKesh'}
        </div>
        <p className={styles.operadoraHint}>
          Digite seu número de telefone. A operadora será detectada automaticamente.
        </p>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="phone">Número de telefone</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={paymentDetails.phone || ''}
          onChange={handlePhoneChange}
          placeholder="84 123 4567"
          className={`${styles.input} ${errors?.payment ? styles.inputError : ''}`}
        />
        {errors?.payment && (
          <span className={styles.errorMessage}>{errors.payment}</span>
        )}
        <span className={styles.hint}>
          Você receberá uma notificação no seu telefone para confirmar o pagamento
        </span>
      </div>

      <div className={styles.simulateButton}>
        <button className={styles.mockButton} type="button">
          Simular Pagamento (Demo)
        </button>
        <p className={styles.mockHint}>Modo demonstração - não será cobrado</p>
      </div>
    </div>
  );
};

export default FormaPagamentoMPesa;