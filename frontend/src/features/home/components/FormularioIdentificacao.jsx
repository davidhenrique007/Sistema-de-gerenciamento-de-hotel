import React, { useState, useEffect } from 'react';
import {
  validatePhone,
  validateRequired,
  validateMinLength,
  validateEmail,
} from '../../../shared/utils/validators';
import { mascaraTelefone, mascaraDocumento, removerMascara } from '../../../shared/utils/mascaras';
import styles from './FormularioIdentificacao.module.css';

const FormularioIdentificacao = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    documento: '',
    email: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validarCampo = (name, value) => {
    console.log(`🔍 Validando campo ${name}:`, value);

    try {
      switch (name) {
        case 'nome':
          validateRequired(value, 'Nome');
          validateMinLength(value, 3, 'Nome');
          break;

        case 'telefone':
          console.log('📞 Telefone COM máscara:', value);
          const semMascara = removerMascara(value);
          console.log('📞 Telefone SEM máscara:', semMascara);
          validateRequired(value, 'Telefone');
          validatePhone(semMascara, { format: 'international' });
          console.log('✅ Telefone válido!');
          break;

        case 'documento':
          if (value) validateMinLength(value, 6, 'Documento');
          break;

        case 'email':
          if (value) validateEmail(value);
          break;

        default:
          break;
      }
      return null;
    } catch (error) {
      console.log('❌ Erro na validação:', error.message);
      return error.message;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let novoValor = value;

    if (name === 'telefone') novoValor = mascaraTelefone(value);
    if (name === 'documento') novoValor = mascaraDocumento(value);

    setFormData((prev) => ({ ...prev, [name]: novoValor }));

    // Validação em tempo real
    const error = validarCampo(name, name === 'telefone' ? removerMascara(value) : value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar todos os campos
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const value = key === 'telefone' ? removerMascara(formData[key]) : formData[key];
      const error = validarCampo(key, value);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onSubmit({
      name: formData.nome,
      phone: removerMascara(formData.telefone),
      document: formData.documento || undefined,
      email: formData.email || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Identificação</h2>

      <div className={styles.field}>
        <label>Nome Completo *</label>
        <input
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isLoading}
        />
        {touched.nome && errors.nome && <span className={styles.error}>{errors.nome}</span>}
      </div>

      <div className={styles.field}>
        <label>Telefone *</label>
        <input
          name="telefone"
          value={formData.telefone}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="84 123 4567"
          disabled={isLoading}
        />

        {/* LOG PARA DEBUG */}
        {console.log('📊 Estado do telefone:', {
          touched: touched.telefone,
          error: errors.telefone,
        })}

        {touched.telefone && errors.telefone && (
          <span className={styles.error}>{errors.telefone}</span>
        )}
      </div>

      <div className={styles.field}>
        <label>Documento (opcional)</label>
        <input
          name="documento"
          value={formData.documento}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="AB123456C"
          disabled={isLoading}
        />
        {touched.documento && errors.documento && (
          <span className={styles.error}>{errors.documento}</span>
        )}
      </div>

      <div className={styles.field}>
        <label>E-mail (opcional)</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="seu@email.com"
          disabled={isLoading}
        />
        {touched.email && errors.email && <span className={styles.error}>{errors.email}</span>}
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Processando...' : 'Continuar'}
      </button>
    </form>
  );
};

export default FormularioIdentificacao;
