import React from 'react';
import styles from '../styles/Checkout.module.css';

const FormularioDadosPessoais = ({ guestData, setGuestData, errors, isIdentificado, t }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setGuestData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formGroup}>
        <label className={styles.label}>
          {t('form.full_name')} <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          name="nome"
          value={guestData.nome || ''}
          onChange={handleChange}
          className={styles.input}
          placeholder={t('form.full_name_placeholder')}
        />
        {errors.nome && <span className={styles.error}>{errors.nome}</span>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          {t('form.email')} <span className={styles.required}>*</span>
        </label>
        <input
          type="email"
          name="email"
          value={guestData.email || ''}
          onChange={handleChange}
          className={styles.input}
          placeholder={t('form.email_placeholder')}
        />
        {errors.email && <span className={styles.error}>{errors.email}</span>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          {t('form.phone')} <span className={styles.required}>*</span>
        </label>
        <input
          type="tel"
          name="telefone"
          value={guestData.telefone || ''}
          onChange={handleChange}
          className={styles.input}
          placeholder={t('form.phone_placeholder')}
        />
        {errors.telefone && <span className={styles.error}>{errors.telefone}</span>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          {t('form.id_number')} ({t('common.optional')})
        </label>
        <input
          type="text"
          name="documento"
          value={guestData.documento || ''}
          onChange={handleChange}
          className={styles.input}
          placeholder={t('form.id_number_placeholder')}
        />
        {errors.documento && <span className={styles.error}>{errors.documento}</span>}
      </div>

      <div className={styles.formHint}>
        <small>✉️ {t('form.email_confirmation_hint')}</small>
      </div>
    </div>
  );
};

export default FormularioDadosPessoais;