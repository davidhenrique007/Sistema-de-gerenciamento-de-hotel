// =====================================================
// COMPONENTE - FORMULÁRIO DE DADOS PESSOAIS
// =====================================================

import React from 'react';
import { mascaraTelefone, removerMascara } from '../../../../../shared/utils/mascaras';
import styles from '../styles/Checkout.module.css';

const FormularioDadosPessoais = ({ guestData, setGuestData, errors, isIdentificado }) => {
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    let novoValor = value;
    
    if (name === 'telefone') {
      novoValor = mascaraTelefone(value);
    }
    
    setGuestData(prev => ({ ...prev, [name]: novoValor }));
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formGrid}>
        {/* Nome completo */}
        <div className={styles.formGroup}>
          <label htmlFor="nome">
            Nome completo <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={guestData.nome}
            onChange={handleChange}
            placeholder="Digite seu nome completo"
            className={`${styles.input} ${errors.nome ? styles.inputError : ''}`}
          />
          {errors.nome && <span className={styles.errorMessage}>{errors.nome}</span>}
        </div>

        {/* Telefone */}
        <div className={styles.formGroup}>
          <label htmlFor="telefone">
            Telefone <span className={styles.required}>*</span>
          </label>
          <input
            type="tel"
            id="telefone"
            name="telefone"
            value={guestData.telefone}
            onChange={handleChange}
            placeholder="84 123 4567"
            className={`${styles.input} ${errors.telefone ? styles.inputError : ''}`}
          />
          {errors.telefone && <span className={styles.errorMessage}>{errors.telefone}</span>}
          <span className={styles.hint}>Ex: 84 123 4567</span>
        </div>

        {/* Documento (opcional) */}
        <div className={styles.formGroup}>
          <label htmlFor="documento">Documento (opcional)</label>
          <input
            type="text"
            id="documento"
            name="documento"
            value={guestData.documento}
            onChange={handleChange}
            placeholder="BI ou Passaporte"
            className={`${styles.input} ${errors.documento ? styles.inputError : ''}`}
          />
          {errors.documento && <span className={styles.errorMessage}>{errors.documento}</span>}
        </div>
      </div>

      {!isIdentificado && (
        <p className={styles.loginInfo}>
          Já tem cadastro? <a href="/login-cliente">Faça login</a> para preencher automaticamente.
        </p>
      )}
    </div>
  );
};

export default FormularioDadosPessoais;