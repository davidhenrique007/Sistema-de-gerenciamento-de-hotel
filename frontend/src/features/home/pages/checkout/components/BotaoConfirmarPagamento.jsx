// =====================================================
// COMPONENTE - BOTÃO CONFIRMAR PAGAMENTO
// =====================================================

import React from 'react';
import styles from '../styles/Checkout.module.css';

const BotaoConfirmarPagamento = ({ 
  isFormValid, 
  isLoading, 
  onClick,
  texto = 'Confirmar Pagamento'
}) => {
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
            Processando...
          </>
        ) : (
          texto
        )}
      </button>
      
      {!isFormValid && (
        <p className={styles.confirmHint}>
          Preencha todos os campos obrigatórios e selecione um método de pagamento
        </p>
      )}
    </div>
  );
};

export default BotaoConfirmarPagamento;