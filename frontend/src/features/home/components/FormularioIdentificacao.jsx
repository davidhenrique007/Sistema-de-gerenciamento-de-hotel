import React, { useState, useEffect } from 'react';
import {
  validatePhone,
  validateRequired,
  validateMinLength,
  validateEmail,
} from '../../../shared/utils/validators';
import { mascaraTelefone, mascaraDocumento, removerMascara } from '../../../shared/utils/mascaras';
import styles from './FormularioIdentificacao.module.css';

const FormularioIdentificacao = ({ onSubmit, isLoading, t }) => {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    documento: '',
    email: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // FunÃ§Ã£o de validaÃ§Ã£o com suporte a i18n
  const validarCampo = (name, value) => {
    console.log(`ðŸ” Validando campo ${name}:`, value);

    try {
      switch (name) {
        case 'nome':
          validateRequired(value, t('form.full_name'));
          validateMinLength(value, 3, t('form.full_name'));
          break;

        case 'telefone':
          console.log('ðŸ“ž Telefone COM mÃ¡scara:', value);
          const semMascara = removerMascara(value);
          console.log('ðŸ“ž Telefone SEM mÃ¡scara:', semMascara);
          validateRequired(value, t('form.phone'));
          validatePhone(semMascara, { format: 'international' });
          console.log('âœ… Telefone vÃ¡lido!');
          break;

        case 'documento':
          if (value) validateMinLength(value, 6, t('form.id_number'));
          break;

        case 'email':
          if (value) validateEmail(value);
          break;

        default:
          break;
      }
      return null;
    } catch (error) {
      console.log('âŒ Erro na validaÃ§Ã£o:', error.message);
      return error.message;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let novoValor = value;

    if (name === 'telefone') novoValor = mascaraTelefone(value);
    if (name === 'documento') novoValor = mascaraDocumento(value);

    setFormData((prev) => ({ ...prev, [name]: novoValor }));

    const error = validarCampo(name, name === 'telefone' ? removerMascara(value) : value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const value = key === 'telefone' ? removerMascara(formData[key]) : formData[key];
      const error = validarCampo(key, value);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onSubmit({
      nome: formData.nome,
      telefone: removerMascara(formData.telefone),
      documento: formData.documento || undefined,
      email: formData.email || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* TÃ­tulo internacionalizado */}
      <div className={styles.headerSection}>
        <h2 className={styles.title}>{t('checkout.personal_data')}</h2>
        <p className={styles.subtitle}>
          {t('form.instructions') || 'Preencha as informaÃ§Ãµes para continuar com o checkout'}
        </p>
        <div className={styles.securityBadge}>
          <span className={styles.lockIcon}>ðŸ”’</span>
          <span className={styles.securityText}>{t('common.protected_data') || 'Seus dados sÃ£o protegidos'}</span>
        </div>
      </div>

      <div className={styles.field}>
        <label>
          {t('form.full_name')} <span className={styles.required}>*</span>
        </label>
        <input
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={t('form.full_name_placeholder')}
          disabled={isLoading}
        />
        {touched.nome && errors.nome && <span className={styles.error}>{errors.nome}</span>}
      </div>

      <div className={styles.field}>
        <label>
          {t('form.phone')} <span className={styles.required}>*</span>
        </label>
        <input
          name="telefone"
          value={formData.telefone}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={t('form.phone_placeholder')}
          disabled={isLoading}
        />
        {touched.telefone && errors.telefone && (
          <span className={styles.error}>{errors.telefone}</span>
        )}
      </div>

      <div className={styles.field}>
        <label>{t('form.id_number')} ({t('common.optional')})</label>
        <input
          name="documento"
          value={formData.documento}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={t('form.id_number_placeholder')}
          disabled={isLoading}
        />
        {touched.documento && errors.documento && (
          <span className={styles.error}>{errors.documento}</span>
        )}
      </div>

      <div className={styles.field}>
        <label>{t('form.email')} ({t('common.optional')})</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={t('form.email_placeholder')}
          disabled={isLoading}
        />
        {touched.email && errors.email && <span className={styles.error}>{errors.email}</span>}
        <p className={styles.fieldHint}>
          âœ‰ï¸ {t('form.email_confirmation_hint') || 'Enviaremos sua confirmaÃ§Ã£o de reserva por e-mail'}
        </p>
      </div>

      <button type="submit" disabled={isLoading} className={styles.submitButton}>
        {isLoading ? t('common.loading') : t('payment.button')}
      </button>
    </form>
  );
};

export default FormularioIdentificacao;
