import React, { useState } from 'react';
import styles from '../styles/Checkout.module.css';

// Componente de pagamento M-Pesa - AGORA VAZIO (só a aba, sem formulário)
const FormaPagamentoMPesa = ({ t }) => {
  return (
    <div className={styles.mpesaEmptyMessage}>
      <p>{t('checkout.select_credit_card_or_cash')}</p>
    </div>
  );
};

// Componente de pagamento em Dinheiro
const FormaPagamentoDinheiro = ({ t }) => {
  return (
    <div className={styles.cashInfo}>
      <div className={styles.cashIcon}>💵</div>
      <h4>{t('checkout.payment_on_arrival')}</h4>
      <p>{t('checkout.you_can_pay_at_reception')}</p>
      <div className={styles.cashWarning}>
        <span>⚠️</span>
        <small>{t('checkout.free_cancellation')}</small>
      </div>
    </div>
  );
};

const MetodosPagamento = ({ paymentMethod, setPaymentMethod, paymentDetails, setPaymentDetails, errors, t }) => {
  const [activeTab, setActiveTab] = useState('mpesa');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPaymentMethod(tab);
    setPaymentDetails({});
  };

  const tabs = [
    { id: 'mpesa', label: t('payment.mpesa'), icon: '📱' },
    { id: 'cartao', label: t('payment.credit_card'), icon: '💳' },
    { id: 'dinheiro', label: t('payment.cash'), icon: '💵' }
  ];

  return (
    <div>
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

      <div className={styles.tabContent}>
        {activeTab === 'mpesa' && (
          <FormaPagamentoMPesa t={t} />
        )}
        
        {activeTab === 'cartao' && (
          <div className={styles.stripePlaceholder}>
            <p>🔒 {t('checkout.secure_payment')}</p>
            <p className={styles.hint}>{t('checkout.card_form_below')}</p>
          </div>
        )}
        
        {activeTab === 'dinheiro' && (
          <FormaPagamentoDinheiro t={t} />
        )}
      </div>
    </div>
  );
};

export default MetodosPagamento;