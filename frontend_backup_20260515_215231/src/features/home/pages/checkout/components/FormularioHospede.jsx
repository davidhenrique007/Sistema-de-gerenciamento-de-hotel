import React from 'react';
import styles from '../styles/Checkout.module.css';

const FormularioHospede = ({ guestData, setGuestData, isIdentificado }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setGuestData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.formGrid}>
      <div className={styles.formGroup}>
        <label>Nome completo *</label>
        <input
          type="text"
          name="nome"
          value={guestData.nome}
          onChange={handleChange}
          placeholder="Digite seu nome completo"
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Telefone *</label>
        <input
          type="tel"
          name="telefone"
          value={guestData.telefone}
          onChange={handleChange}
          placeholder="84XXXXXXX"
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Documento (opcional)</label>
        <input
          type="text"
          name="documento"
          value={guestData.documento}
          onChange={handleChange}
          placeholder="BI ou Passaporte"
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={guestData.email}
          onChange={handleChange}
          placeholder="email@exemplo.com"
          className={styles.input}
        />
      </div>

      {!isIdentificado && (
        <p className={styles.loginInfo}>
          Já tem cadastro? <a href="/login-cliente">Faça login</a>
        </p>
      )}
    </div>
  );
};

export default FormularioHospede;
