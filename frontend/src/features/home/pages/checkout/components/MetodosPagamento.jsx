import React, { useState } from 'react';
import styles from '../styles/Checkout.module.css';

// Componente de pagamento M-Pesa - AGORA VAZIO (só a aba, sem formulário)
const FormaPagamentoMPesa = ({ paymentDetails, setPaymentDetails, errors, setPaymentMethod }) => {
  // Componente vazio - apenas para manter a aba visível
  return (
    <div className={styles.mpesaEmptyMessage}>
      <p>Selecione Cartão de Crédito ou Dinheiro para continuar</p>
    </div>
  );
};

// Componente de pagamento em Dinheiro
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

      {/* Conteúdo - M-Pesa agora está vazio */}
      <div className={styles.tabContent}>
        {activeTab === 'mpesa' && (
          <FormaPagamentoMPesa
            paymentDetails={paymentDetails}
            setPaymentDetails={setPaymentDetails}
            errors={errors}
            setPaymentMethod={setPaymentMethod}
          />
        )}
        
        {activeTab === 'cartao' && (
          <div className={styles.stripePlaceholder}>
            <p>🔒 Pagamento seguro com Stripe</p>
            <p className={styles.hint}>O formulário de cartão aparecerá abaixo</p>
          </div>
        )}
        
        {activeTab === 'dinheiro' && (
          <FormaPagamentoDinheiro />
        )}
      </div>
    </div>
  );
};

export default MetodosPagamento;
