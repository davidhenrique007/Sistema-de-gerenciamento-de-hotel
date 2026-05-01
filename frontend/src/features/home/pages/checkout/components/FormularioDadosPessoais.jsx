import React from 'react';
import styles from '../styles/Checkout.module.css';

const FormularioDadosPessoais = ({ guestData, setGuestData, errors, isIdentificado }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setGuestData(prev => ({ ...prev, [name]: value }));
  };

  console.log('📝 Dados do cliente:', guestData);
  console.log('🔑 Identificado:', isIdentificado);

  return (
    <div className={styles.formContainer}>
      <div className={styles.formGroup}>
        <label className={styles.label}>
          Nome completo <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          name="nome"
          value={guestData.nome || ''}
          onChange={handleChange}
          className={styles.input}
          placeholder="Digite seu nome completo"
        />
        {errors.nome && <span className={styles.error}>{errors.nome}</span>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          Email <span className={styles.required}>*</span>
        </label>
        <input
          type="email"
          name="email"
          value={guestData.email || ''}
          onChange={handleChange}
          className={styles.input}
          placeholder="Digite seu email"
        />
        {errors.email && <span className={styles.error}>{errors.email}</span>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          Telefone <span className={styles.required}>*</span>
        </label>
        <input
          type="tel"
          name="telefone"
          value={guestData.telefone || ''}
          onChange={handleChange}
          className={styles.input}
          placeholder="Digite seu telefone"
        />
        {errors.telefone && <span className={styles.error}>{errors.telefone}</span>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          Nº de Identificação
        </label>
        <input
          type="text"
          name="documento"
          value={guestData.documento || ''}
          onChange={handleChange}
          className={styles.input}
          placeholder="Digite seu número de identificação"
        />
        {errors.documento && <span className={styles.error}>{errors.documento}</span>}
      </div>
    </div>
  );
};

export default FormularioDadosPessoais;
