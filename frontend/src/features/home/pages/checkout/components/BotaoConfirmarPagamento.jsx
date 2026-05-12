// =====================================================
// COMPONENTE - BOTÃO CONFIRMAR PAGAMENTO
// Versão: 2.0.0 (Com suporte a i18n)
// =====================================================

import React from 'react';
import styles from '../styles/Checkout.module.css';

const BotaoConfirmarPagamento = ({ 
  isFormValid, 
  isLoading, 
  onClick,
  texto,
  t  // ✅ Adicionado suporte a i18n
}) => {
  // Função para obter o texto do botão com fallback
  const getButtonText = () => {
    if (isLoading) {
      return t('common.loading') || 'Processando...';
    }
    if (texto) {
      return texto;
    }
    return t('payment.confirm_button') || 'Confirmar Pagamento';
  };

  // Função para obter a mensagem de hint
  const getHintMessage = () => {
    return t('checkout.fill_required_fields') || 'Preencha todos os campos obrigatórios e selecione um método de pagamento';
  };

  return (
    <div className={styles.confirmButtonContainer}>
      <button
        className={`${styles.confirmButton} ${isFormValid ? styles.confirmActive : styles.confirmDisabled}`}
        onClick={onClick}
        disabled={!isFormValid || isLoading}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner}></span>
            {getButtonText()}
          </>
        ) : (
          getButtonText()
        )}
      </button>
      
      {!isFormValid && (
        <p className={styles.confirmHint}>
          {getHintMessage()}
        </p>
      )}
    </div>
  );
};

export default BotaoConfirmarPagamento;