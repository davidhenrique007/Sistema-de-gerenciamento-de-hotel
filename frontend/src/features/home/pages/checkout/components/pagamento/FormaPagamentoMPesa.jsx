// =====================================================
// COMPONENTE - PAGAMENTO MÓVEL (M-Pesa / E-mola / mKesh)
// =====================================================

import React, { useState } from 'react';
import { mascaraTelefone, removerMascara } from '../../../../../../shared/utils/mascaras';
import styles from '../../styles/Checkout.module.css';

const FormaPagamentoMPesa = ({ paymentDetails, setPaymentDetails, errors }) => {
  const [operadora, setOperadora] = useState('mpesa');

  const operadoras = [
    { id: 'mpesa', label: 'M-Pesa', prefixos: ['84', '85'], icon: '📱', cor: '#4CAF50' },
    { id: 'emola', label: 'E-mola', prefixos: ['86', '87'], icon: '📲', cor: '#2196F3' },
    { id: 'mkesh', label: 'mKesh', prefixos: ['82', '83'], icon: '💳', cor: '#FF9800' }
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

  const operadoraAtual = operadoras.find(op => op.id === operadora);

  return (
    <div className={styles.paymentMethodContent}>
      {/* Seletor de Operadora Visual */}
      <div className={styles.operadoraSelector}>
        {operadoras.map(op => (
          <button
            key={op.id}
            className={`${styles.operadoraButton} ${operadora === op.id ? styles.operadoraActive : ''}`}
            onClick={() => setOperadora(op.id)}
            style={{
              borderColor: operadora === op.id ? op.cor : '#e0e0e0',
              background: operadora === op.id ? `${op.cor}10` : 'white'
            }}
          >
            <span className={styles.operadoraIcon}>{op.icon}</span>
            <span className={styles.operadoraLabel}>{op.label}</span>
          </button>
        ))}
      </div>

      {/* Card de Informação da Operadora */}
      <div className={styles.operadoraInfoCard}>
        <div className={styles.operadoraInfoIcon}>{operadoraAtual?.icon}</div>
        <div>
          <h4 className={styles.operadoraInfoTitle}>{operadoraAtual?.label}</h4>
          <p className={styles.operadoraInfoDesc}>
            {operadora === 'mpesa' && 'Pagamento via M-Pesa (Vodacom)'}
            {operadora === 'emola' && 'Pagamento via E-mola (Movitel)'}
            {operadora === 'mkesh' && 'Pagamento via mKesh (Tmcel)'}
          </p>
        </div>
      </div>

      {/* Campo de Telefone */}
      <div className={styles.formGroup}>
        <label htmlFor="phone">
          Número de telefone <span className={styles.required}>*</span>
        </label>
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
          {operadora === 'mpesa' && 'Digite seu número M-Pesa (84 ou 85)'}
          {operadora === 'emola' && 'Digite seu número E-mola (86 ou 87)'}
          {operadora === 'mkesh' && 'Digite seu número mKesh (82 ou 83)'}
        </span>
      </div>

      {/* Instruções de pagamento */}
      <div className={styles.paymentInstructions}>
        <p className={styles.instructionsTitle}>📌 Como funciona:</p>
        <ol className={styles.instructionsList}>
          <li>Você receberá uma notificação no seu telefone</li>
          <li>Confirme a transação no seu aplicativo</li>
          <li>O pagamento será processado em segundos</li>
        </ol>
      </div>

      {/* Botão de simulação */}
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