import React, { useState } from 'react';
import styles from '../styles/Checkout.module.css';

// Componentes de cada método de pagamento
const FormaPagamentoMPesa = ({ paymentDetails, setPaymentDetails, errors }) => {
  const [operadora, setOperadora] = useState('mpesa');

  const operadoras = [
    { id: 'mpesa', label: 'M-Pesa', prefixos: ['84', '85'] },
    { id: 'emola', label: 'E-mola', prefixos: ['86', '87'] },
    { id: 'mkesh', label: 'mKesh', prefixos: ['82', '83'] }
  ];

  const handlePhoneChange = (e) => {
    const valor = e.target.value;
    // Aplica máscara de telefone
    const numeros = valor.replace(/\D/g, '');
    let mascara = numeros;
    
    if (numeros.length > 2) {
      mascara = `${numeros.substring(0, 2)} ${numeros.substring(2, 5)} ${numeros.substring(5, 9)}`;
    }
    
    setPaymentDetails({ phone: mascara.trim() });
    
    // Detectar operadora
    if (numeros.length >= 2) {
      const prefixo = numeros.substring(0, 2);
      const op = operadoras.find(o => o.prefixos.includes(prefixo));
      if (op) setOperadora(op.id);
    }
  };

  return (
    <div>
      <div className={styles.operadoraInfo}>
        <span className={styles.operadoraBadge}>
          {operadora === 'mpesa' && '📱 M-Pesa'}
          {operadora === 'emola' && '📱 E-mola'}
          {operadora === 'mkesh' && '📱 mKesh'}
        </span>
      </div>
      
      <div className={styles.formGroup}>
        <label>Número de telefone</label>
        <input
          type="tel"
          value={paymentDetails?.phone || ''}
          onChange={handlePhoneChange}
          placeholder="84 123 4567"
          className={errors?.payment ? styles.inputError : styles.input}
        />
        {errors?.payment && <span className={styles.errorMessage}>{errors.payment}</span>}
        <small>Você receberá uma notificação para confirmar o pagamento</small>
      </div>
    </div>
  );
};

const FormaPagamentoCartao = ({ paymentDetails, setPaymentDetails, errors }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;
    
    if (name === 'cardNumber') {
      formatted = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19);
    }
    if (name === 'expiry') {
      formatted = value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/g, '$1/').slice(0, 5);
    }
    if (name === 'cvv') {
      formatted = value.replace(/\D/g, '').slice(0, 4);
    }
    
    setPaymentDetails(prev => ({ ...prev, [name]: formatted }));
  };

  return (
    <div>
      <div className={styles.formGroup}>
        <label>Número do cartão</label>
        <input
          type="text"
          name="cardNumber"
          value={paymentDetails?.cardNumber || ''}
          onChange={handleChange}
          placeholder="0000 0000 0000 0000"
          className={errors?.payment ? styles.inputError : styles.input}
        />
      </div>
      
      <div className={styles.formGroup}>
        <label>Nome no cartão</label>
        <input
          type="text"
          name="cardHolder"
          value={paymentDetails?.cardHolder || ''}
          onChange={handleChange}
          placeholder="Como aparece no cartão"
          className={styles.input}
        />
      </div>
      
      <div className={styles.rowFields}>
        <div className={styles.formGroup}>
          <label>Validade</label>
          <input
            type="text"
            name="expiry"
            value={paymentDetails?.expiry || ''}
            onChange={handleChange}
            placeholder="MM/AA"
            className={errors?.payment ? styles.inputError : styles.input}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>CVV</label>
          <input
            type="text"
            name="cvv"
            value={paymentDetails?.cvv || ''}
            onChange={handleChange}
            placeholder="123"
            className={errors?.payment ? styles.inputError : styles.input}
          />
        </div>
      </div>
      
      {errors?.payment && <span className={styles.errorMessage}>{errors.payment}</span>}
      
      <div className={styles.mockHint}>
        <small>Teste: 4242 4242 4242 4242 | CVV: 123</small>
      </div>
    </div>
  );
};

const FormaPagamentoDinheiro = () => {
  return (
    <div className={styles.cashInfo}>
      <div className={styles.cashIcon}>💵</div>
      <h4>Pagamento na chegada</h4>
      <p>Você poderá pagar diretamente na recepção do hotel.</p>
      <div className={styles.cashWarning}>
        <span>⚠️</span>
        <small>Reserva será confirmada após o pagamento. Cancelamento gratuito até 24h antes.</small>
      </div>
    </div>
  );
};

// =====================================================
// COMPONENTE PRINCIPAL - MÉTODOS DE PAGAMENTO
// =====================================================

const MetodosPagamento = ({ paymentMethod, setPaymentMethod, paymentDetails, setPaymentDetails, errors }) => {
  const [activeTab, setActiveTab] = useState('mpesa');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPaymentMethod(tab);
    setPaymentDetails({});
  };

  const tabs = [
    { id: 'mpesa', label: 'M-Pesa / E-mola', icon: '📱' },
    { id: 'cartao', label: 'Cartão de Crédito', icon: '💳' },
    { id: 'dinheiro', label: 'Dinheiro', icon: '💵' }
  ];

  return (
    <div>
      {/* Tabs */}
      <div className={styles.paymentTabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className={styles.tabContent}>
        {activeTab === 'mpesa' && (
          <FormaPagamentoMPesa
            paymentDetails={paymentDetails}
            setPaymentDetails={setPaymentDetails}
            errors={errors}
          />
        )}
        
        {activeTab === 'cartao' && (
          <FormaPagamentoCartao
            paymentDetails={paymentDetails}
            setPaymentDetails={setPaymentDetails}
            errors={errors}
          />
        )}
        
        {activeTab === 'dinheiro' && (
          <FormaPagamentoDinheiro />
        )}
      </div>
    </div>
  );
};

export default MetodosPagamento;